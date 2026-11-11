package app.gitapath.circle.internal;

import app.gitapath.identity.UserDirectory;
import app.gitapath.learning.VerseStepCompleted;
import app.gitapath.shared.ApiException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Family Circles (FR-FC-01..07): max 8 members, owner approves joins, invite codes expire after 7 days. */
@Service
class CircleService {
    static final int MAX_MEMBERS = 8;
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    record Member(String userId, String name, String status, int done) {}
    record FeedItem(String who, String what, OffsetDateTime at) {}
    record CircleView(UUID id, String name, String code, OffsetDateTime codeExpiresAt, String ownerId, String challengeTitle, int challengeChapter, List<Member> members, List<FeedItem> feed) {}
    record Preview(String name, String ownerName, int memberCount, String challengeTitle) {}

    private final JdbcClient db;
    private final UserDirectory users;

    CircleService(JdbcClient db, UserDirectory users) {
        this.db = db;
        this.users = users;
    }

    @Transactional
    CircleView create(String ownerId, String name) {
        if (circleOf(ownerId).isPresent()) throw ApiException.badRequest("You are already in a Circle");
        UUID id = UUID.randomUUID();
        db.sql("insert into circles (id, name, code, owner_id, challenge_title, challenge_chapter, code_expires_at) values (?, ?, ?, ?, ?, 2, now() + interval '7 days')")
                .params(id, name, newCode(), ownerId, "Finish Chapter 2 together").update();
        db.sql("insert into circle_members (circle_id, user_id, status) values (?, ?, 'member')").params(id, ownerId).update();
        feed(id, users.nameOf(ownerId), "created the Circle");
        return view(id);
    }

    Optional<UUID> circleOf(String userId) {
        return db.sql("select circle_id from circle_members where user_id = ? and status = 'member'").param(userId).query(UUID.class).optional();
    }

    CircleView mine(String userId) {
        return circleOf(userId).map(this::view).orElseThrow(() -> ApiException.notFound("Circle"));
    }

    @Transactional
    CircleView newInvite(String userId) {
        UUID id = ownedCircle(userId);
        db.sql("update circles set code = ?, code_expires_at = now() + interval '7 days' where id = ?").params(newCode(), id).update();
        return view(id);
    }

    Preview preview(String code) {
        return db.sql("""
                select c.name, u.name owner_name, (select count(*) from circle_members m where m.circle_id = c.id and m.status = 'member') member_count, c.challenge_title
                from circles c join users u on u.id = c.owner_id where c.code = ? and c.code_expires_at > now()
                """).param(code.toUpperCase()).query(Preview.class).optional().orElseThrow(() -> ApiException.notFound("Invite"));
    }

    @Transactional
    void requestJoin(String userId, String code) {
        UUID id = db.sql("select id from circles where code = ? and code_expires_at > now()").param(code.toUpperCase()).query(UUID.class).optional()
                .orElseThrow(() -> ApiException.notFound("Invite"));
        if (circleOf(userId).isPresent()) throw ApiException.badRequest("You are already in a Circle");
        if (memberCount(id) >= MAX_MEMBERS) throw ApiException.badRequest("This Circle is full");
        db.sql("insert into circle_members (circle_id, user_id, status) values (?, ?, 'pending') on conflict do nothing").params(id, userId).update();
    }

    @Transactional
    CircleView decide(String ownerId, String memberId, boolean approve) {
        UUID id = ownedCircle(ownerId);
        if (approve) {
            if (memberCount(id) >= MAX_MEMBERS) throw ApiException.badRequest("This Circle is full");
            int n = db.sql("update circle_members set status = 'member', joined_at = now() where circle_id = ? and user_id = ? and status = 'pending'").params(id, memberId).update();
            if (n == 0) throw ApiException.notFound("Join request");
            feed(id, users.nameOf(memberId), "joined the Circle");
        } else {
            db.sql("delete from circle_members where circle_id = ? and user_id = ? and status = 'pending'").params(id, memberId).update();
        }
        return view(id);
    }

    @Transactional
    void leave(String userId) {
        circleOf(userId).ifPresent(id -> db.sql("delete from circle_members where circle_id = ? and user_id = ?").params(id, userId).update());
    }

    /** Circle feed reacts to progress in the learning module. */
    @ApplicationModuleListener
    void on(VerseStepCompleted e) {
        circleOf(e.userId()).ifPresent(id -> feed(id, users.nameOf(e.userId()), "finished verse " + e.verseId()));
    }

    CircleView view(UUID id) {
        var c = db.sql("select id, name, code, code_expires_at, owner_id, challenge_title, challenge_chapter from circles where id = ?").param(id)
                .query((rs, n) -> new Object[] {rs.getObject("id", UUID.class), rs.getString("name"), rs.getString("code"), rs.getObject("code_expires_at", OffsetDateTime.class),
                        rs.getString("owner_id"), rs.getString("challenge_title"), rs.getInt("challenge_chapter")})
                .single();
        List<Member> members = db.sql("""
                select m.user_id, u.name, m.status,
                  (select count(*) from verse_steps s where s.user_id = m.user_id and s.completed_at is not null and s.verse_id like ? ) done
                from circle_members m join users u on u.id = m.user_id where m.circle_id = ? order by m.joined_at
                """).params(c[6] + ".%", id).query(Member.class).list();
        List<FeedItem> feed = db.sql("select who, what, at from circle_feed where circle_id = ? order by at desc limit 20").param(id).query(FeedItem.class).list();
        return new CircleView((UUID) c[0], (String) c[1], (String) c[2], (OffsetDateTime) c[3], (String) c[4], (String) c[5], (Integer) c[6], members, feed);
    }

    private UUID ownedCircle(String userId) {
        return db.sql("select id from circles where owner_id = ?").param(userId).query(UUID.class).optional()
                .orElseThrow(() -> ApiException.forbidden("Only the Circle owner can do this"));
    }

    private int memberCount(UUID id) {
        return db.sql("select count(*) from circle_members where circle_id = ? and status = 'member'").param(id).query(Integer.class).single();
    }

    private void feed(UUID id, String who, String what) {
        db.sql("insert into circle_feed (circle_id, who, what) values (?, ?, ?)").params(id, who, what).update();
    }

    private static String newCode() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        return sb.toString();
    }
}
