# 데이터베이스 스키마 및 Mock 데이터

## 테이블 구조

### tickets (티켓 테이블)

- `id`: 티켓 고유 ID (VARCHAR)
- `date`: 공연 날짜 (DATE)
- `time`: 공연 시간 (TIME)
- `performance_name`: 정규화된 작품명 (VARCHAR)
- `genre`: 장르 (ENUM: '연극', '뮤지컬')
- `is_child`: 어린이 공연 여부 (BOOLEAN)
- `theater`: 정규화된 극장명 (VARCHAR)
- `seat`: 좌석 정보 (VARCHAR)
- `ticket_price`: 티켓 가격 (INT)
- `companion`: 동행자 (VARCHAR, nullable)
- `md_price`: MD 가격 (INT)
- `rating`: 별점 0-5 (TINYINT)
- `review`: 공연 후기 (TEXT, nullable)
- `poster_url`: 포스터 URL (VARCHAR, nullable)
- `created_at`, `updated_at`: 타임스탬프

**인덱스:**

- `idx_date`: 날짜 조회 최적화
- `idx_performance_name`: 작품명 검색 최적화
- `idx_genre`: 장르 필터링 최적화
- `idx_theater`: 극장명 검색 최적화
- `idx_rating`: 별점 정렬 최적화

### ticket_castings (배우 캐스팅 테이블)

- `id`: 자동 증가 ID (BIGINT)
- `ticket_id`: 티켓 ID (외래키)
- `actor_name`: 배우 이름 (VARCHAR)

**인덱스:**

- `idx_ticket_id`: 티켓별 배우 조회 최적화
- `idx_actor_name`: 배우별 통계 조회 최적화

## 뷰 (Views)

### v_ticket_stats

전체 통계 조회용 뷰

- 연도, 월, 주, 요일별 집계
- 총 관람 수, 총 금액, 총 MD 금액, 고유 작품 수

### v_actor_stats

배우별 통계 조회용 뷰

- 배우별 관람 횟수, 총 관람 금액, 본 작품 수, 작품 목록

### v_performance_stats

작품별 통계 조회용 뷰

- 작품별 관람 횟수, 총 관람 금액, 평균 별점, 첫 관람일, 마지막 관람일

## Mock 데이터

- 총 45개의 티켓 데이터 (2024년 1월 ~ 2025년 11월)
- 주요 작품:
  - 지킬앤하이드: 8회 관람
  - 캣츠: 7회 관람
  - 햄릿: 8회 관람
  - 웃는남자: 7회 관람
  - 시카고: 7회 관람
  - 레미제라블: 7회 관람
- 다양한 배우 캐스팅 데이터 포함
- 다양한 날짜, 요일, 극장, 가격 분포

## 리포트 조회를 위한 SQL 예시

### 전체 통계 요약

```sql
SELECT
    COUNT(*) AS total_count,
    SUM(ticket_price) AS total_ticket_price,
    SUM(md_price) AS total_md_price,
    COUNT(DISTINCT performance_name) AS unique_performances
FROM tickets;
```

### 가장 많이 본 배우

```sql
SELECT actor_name, COUNT(*) AS view_count
FROM ticket_castings
GROUP BY actor_name
ORDER BY view_count DESC
LIMIT 1;
```

### 가장 많이 본 작품

```sql
SELECT performance_name, COUNT(*) AS view_count
FROM tickets
GROUP BY performance_name
ORDER BY view_count DESC
LIMIT 1;
```

### 월별 관람 수 및 금액

```sql
SELECT
    DATE_FORMAT(date, '%Y-%m') AS year_month,
    COUNT(*) AS count,
    SUM(ticket_price) AS total_price
FROM tickets
WHERE DATE_FORMAT(date, '%Y') = '2024'
GROUP BY year_month
ORDER BY year_month;
```

### 주별 관람 수 및 금액

```sql
SELECT
    DATE_FORMAT(date, '%Y-%u') AS year_week,
    COUNT(*) AS count,
    SUM(ticket_price) AS total_price
FROM tickets
WHERE DATE_FORMAT(date, '%Y-%m') = '2024-01'
GROUP BY year_week
ORDER BY year_week;
```

### 관극 요일 파이 차트

```sql
SELECT
    CASE DAYOFWEEK(date)
        WHEN 1 THEN '일요일'
        WHEN 2 THEN '월요일'
        WHEN 3 THEN '화요일'
        WHEN 4 THEN '수요일'
        WHEN 5 THEN '목요일'
        WHEN 6 THEN '금요일'
        WHEN 7 THEN '토요일'
    END AS day_of_week,
    COUNT(*) AS count
FROM tickets
GROUP BY DAYOFWEEK(date)
ORDER BY DAYOFWEEK(date);
```

### 배우별 통계

```sql
SELECT
    actor_name,
    COUNT(DISTINCT ticket_id) AS view_count,
    SUM(t.ticket_price) AS total_ticket_price,
    COUNT(DISTINCT t.performance_name) AS unique_performances,
    GROUP_CONCAT(DISTINCT t.performance_name ORDER BY t.performance_name SEPARATOR ', ') AS performance_list
FROM ticket_castings tc
JOIN tickets t ON tc.ticket_id = t.id
GROUP BY actor_name
ORDER BY view_count DESC, actor_name ASC;
```

### 작품별 통계

```sql
SELECT
    performance_name,
    COUNT(*) AS view_count,
    SUM(ticket_price) AS total_ticket_price,
    AVG(rating) AS avg_rating
FROM tickets
GROUP BY performance_name
ORDER BY avg_rating DESC, view_count DESC;
```

### 잔디밭 데이터 (GitHub 스타일)

```sql
SELECT
    date,
    COUNT(*) AS count
FROM tickets
GROUP BY date
ORDER BY date;
```
