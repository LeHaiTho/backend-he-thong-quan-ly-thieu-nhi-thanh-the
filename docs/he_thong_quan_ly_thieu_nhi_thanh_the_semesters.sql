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
-- Table structure for table `semesters`
--

DROP TABLE IF EXISTS `semesters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semesters` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `academic_year_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `semester_number` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_academic_semester` (`academic_year_id`,`semester_number`),
  CONSTRAINT `semesters_ibfk_1` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semesters`
--

LOCK TABLES `semesters` WRITE;
/*!40000 ALTER TABLE `semesters` DISABLE KEYS */;
INSERT INTO `semesters` VALUES ('6ed9c807-6646-4f2a-9b75-a881b5c6dbe9','19a9dcda-6a64-444c-ad47-08034aa4d67e','Học kỳ II',2,'2028-01-18','2028-01-31','2026-05-20 15:10:33','2026-05-20 15:10:33',NULL,NULL),('77f5c8e4-a9ef-490f-b36c-ae861612960c','bbc8b4dd-a087-4d4b-b693-f5ae6310cce1','Học kỳ I',1,'2026-09-01','2027-01-15','2026-05-19 09:58:25','2026-05-19 09:58:25',NULL,NULL),('84a206b4-61f5-4f58-945d-2ffa4f9ede3b','19a9dcda-6a64-444c-ad47-08034aa4d67e','Học kỳ I',1,'2027-09-01','2028-01-15','2026-05-20 15:10:33','2026-05-20 15:10:33',NULL,NULL),('e4b0c0d5-daad-4bec-9a85-efcc39604e37','bbc8b4dd-a087-4d4b-b693-f5ae6310cce1','Học kỳ II',2,'2027-01-18','2027-05-31','2026-05-19 09:58:25','2026-05-19 09:58:25',NULL,NULL),('s1','ay2','Học kỳ I',1,'2025-09-01','2026-01-15','2026-05-14 08:29:23','2026-05-14 08:29:23',NULL,NULL),('s2','ay2','Học kỳ II',2,'2026-01-16','2026-05-31','2026-05-14 08:29:23','2026-05-14 08:29:23',NULL,NULL);
/*!40000 ALTER TABLE `semesters` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-28 10:42:01
