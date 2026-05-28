-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: he_thong_quan_ly_thieu_nhi_thanh_the
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `saint_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `pob` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `patron_day` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `parish_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `village` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `family_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `family_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `baptism_date` date DEFAULT NULL,
  `baptism_place` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `baptism_book` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_communion_date` date DEFAULT NULL,
  `first_communion_place` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmation_date` date DEFAULT NULL,
  `confirmation_place` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmation_book` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vow_date` date DEFAULT NULL,
  `level` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `allow_attendance` tinyint(1) DEFAULT '1',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `d2_password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_teachers_code` (`code`),
  KEY `idx_teachers_name` (`first_name`,`last_name`),
  KEY `idx_teachers_parish` (`parish_id`),
  KEY `idx_teachers_status` (`status`),
  CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`parish_id`) REFERENCES `parishes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES ('283a938a-28e5-4711-8a9f-0710d8201548','MGV-0004','Maria','Nguyễn Thị Lan ','Anh',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'active','http://localhost:5000/uploads/1779290880371-883360031.png',NULL,NULL,'2026-05-20 15:28:51','2026-05-23 08:33:22',NULL,NULL),('d24b0ff6-bcc5-43a7-b7eb-bdc41013d7ed','MGV-0001','Đaminh','Nguyễn Tuấn ','Anh','Nam','2000-01-20','Bình Dương','08/08/2025',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'active','http://localhost:5000/uploads/1779177160398-479404737.avif',NULL,NULL,'2026-05-19 07:54:21','2026-05-23 08:33:22',NULL,NULL),('ef5b77fb-e21e-4e42-9f7d-4e26bef19dd3','MGV-0005','Maria','Lâm Minh','Hùng',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'active',NULL,NULL,NULL,'2026-05-21 07:43:15','2026-05-23 08:33:22',NULL,NULL),('fef4f9e2-f659-4921-833e-f53aefe9a5d0','MGV-0003','Đaminh','Nguyễn Văn ','Cương',NULL,'2000-08-29',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'active',NULL,NULL,NULL,'2026-05-19 08:00:31','2026-05-23 08:33:22',NULL,NULL),('ffff5a6d-0e0a-4348-925d-099c97b03687','MGV-0002','Anna','Nguyễn Thị ','Ngọc Bích','Nữ','2001-01-17','Bình Dương',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'active',NULL,NULL,NULL,'2026-05-19 07:59:25','2026-05-23 08:33:22',NULL,NULL),('t1','GLV001',NULL,'Nguyễn Văn','A','male',NULL,NULL,NULL,'0912345678',NULL,NULL,'p1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'active',NULL,NULL,NULL,'2026-05-14 08:29:23','2026-05-19 07:47:23',NULL,'2026-05-19 07:47:23'),('t2','GLV002',NULL,'Trần Thị','B','female',NULL,NULL,NULL,'0987654321',NULL,NULL,'p2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,'active',NULL,NULL,NULL,'2026-05-14 08:29:23','2026-05-19 07:47:27',NULL,'2026-05-19 07:47:27');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-28 10:42:04
