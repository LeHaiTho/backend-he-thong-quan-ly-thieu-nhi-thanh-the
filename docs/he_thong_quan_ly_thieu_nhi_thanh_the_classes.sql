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
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `academic_year_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `block_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `head_teacher_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_academic_class` (`academic_year_id`,`name`),
  KEY `head_teacher_id` (`head_teacher_id`),
  KEY `idx_classes_academic_year` (`academic_year_id`),
  KEY `idx_classes_block` (`block_id`),
  KEY `idx_classes_name` (`name`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`),
  CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`block_id`) REFERENCES `blocks` (`id`),
  CONSTRAINT `classes_ibfk_3` FOREIGN KEY (`head_teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES ('5834e4aa-2cd4-4672-994f-4974078a82ff','ay2','b1','Augustinô - Chiên 2','C1','fef4f9e2-f659-4921-833e-f53aefe9a5d0',NULL,'2026-05-20 06:10:59','2026-05-20 06:10:59',NULL,NULL),('97e0e231-8042-48ec-82f3-ffd74ddc1352','ay2','b1','Anna - Chiên 2','C3','ffff5a6d-0e0a-4348-925d-099c97b03687',NULL,'2026-05-20 06:09:57','2026-05-20 06:09:57',NULL,NULL),('b2d21a37-b3ac-412c-998e-efda30f79254','ay2','b2',' Gôretti - Chiên 2','B1','d24b0ff6-bcc5-43a7-b7eb-bdc41013d7ed',NULL,'2026-05-20 06:14:06','2026-05-20 06:14:06',NULL,NULL),('c1','ay2','b1','Tôma - Chiên 1','C2','d24b0ff6-bcc5-43a7-b7eb-bdc41013d7ed',NULL,'2026-05-14 08:29:23','2026-05-20 06:09:27',NULL,NULL),('c2','ay2','b2','Ấu Nhi 1',NULL,'fef4f9e2-f659-4921-833e-f53aefe9a5d0',NULL,'2026-05-14 08:29:23','2026-05-19 08:01:12',NULL,NULL),('f819c480-3506-4e64-8c00-4b350b940c3d','ay2','c90733e9-998a-4b02-89dc-85a9ac1dde8b','Seraphim - Thiếu 1',NULL,'d24b0ff6-bcc5-43a7-b7eb-bdc41013d7ed',NULL,'2026-05-20 06:28:37','2026-05-20 06:28:37',NULL,NULL);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-28 10:42:03
