-- 티켓 테이블
CREATE TABLE tickets (
    id VARCHAR(255) PRIMARY KEY,
    date DATE NOT NULL COMMENT '공연 날짜 (YYYY-MM-DD)',
    time TIME NOT NULL COMMENT '공연 시간 (HH:MM:SS)',
    performance_name VARCHAR(255) NOT NULL COMMENT '정규화된 작품명',
    genre ENUM('연극', '뮤지컬') COMMENT '장르',
    is_child BOOLEAN DEFAULT FALSE COMMENT '어린이 공연 여부',
    theater VARCHAR(255) NOT NULL COMMENT '정규화된 극장명',
    seat VARCHAR(100) COMMENT '좌석 정보',
    ticket_price INT NOT NULL DEFAULT 0 COMMENT '티켓 가격',
    companion VARCHAR(255) COMMENT '동행자',
    md_price INT NOT NULL DEFAULT 0 COMMENT 'MD 가격',
    rating TINYINT DEFAULT 0 COMMENT '별점 (0-5)',
    review TEXT COMMENT '공연 후기',
    poster_url VARCHAR(500) COMMENT '포스터 URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    INDEX idx_date (date),
    INDEX idx_performance_name (performance_name),
    INDEX idx_genre (genre),
    INDEX idx_theater (theater),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 배우 테이블 (캐스팅 정보)
CREATE TABLE ticket_castings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id VARCHAR(255) NOT NULL COMMENT '티켓 ID',
    actor_name VARCHAR(100) NOT NULL COMMENT '배우 이름',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_actor_name (actor_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 리포트 조회를 위한 뷰
-- 전체 통계 뷰
CREATE VIEW v_ticket_stats AS
SELECT 
    DATE_FORMAT(date, '%Y') AS year,
    DATE_FORMAT(date, '%Y-%m') AS year_month,
    DATE_FORMAT(date, '%Y-%u') AS year_week,
    DAYOFWEEK(date) AS day_of_week,
    COUNT(*) AS total_count,
    SUM(ticket_price) AS total_ticket_price,
    SUM(md_price) AS total_md_price,
    COUNT(DISTINCT performance_name) AS unique_performances,
    genre,
    is_child
FROM tickets
GROUP BY year, year_month, year_week, day_of_week, genre, is_child;

-- 배우별 통계 뷰
CREATE VIEW v_actor_stats AS
SELECT 
    tc.actor_name,
    COUNT(DISTINCT t.id) AS view_count,
    SUM(t.ticket_price) AS total_ticket_price,
    COUNT(DISTINCT t.performance_name) AS unique_performances,
    GROUP_CONCAT(DISTINCT t.performance_name ORDER BY t.performance_name SEPARATOR ', ') AS performance_list
FROM ticket_castings tc
JOIN tickets t ON tc.ticket_id = t.id
GROUP BY tc.actor_name;

-- 작품별 통계 뷰
CREATE VIEW v_performance_stats AS
SELECT 
    performance_name,
    COUNT(*) AS view_count,
    SUM(ticket_price) AS total_ticket_price,
    AVG(rating) AS avg_rating,
    COUNT(DISTINCT date) AS unique_dates,
    MIN(date) AS first_viewed,
    MAX(date) AS last_viewed
FROM tickets
GROUP BY performance_name;

