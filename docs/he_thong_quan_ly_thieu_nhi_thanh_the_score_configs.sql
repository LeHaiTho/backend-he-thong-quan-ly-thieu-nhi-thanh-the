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
-- Table structure for table `score_configs`
--

DROP TABLE IF EXISTS `score_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `score_configs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `semester_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `score_type_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `column_count` int DEFAULT '1',
  `weight_factor` decimal(3,1) DEFAULT '1.0',
  `academic_percentage` int DEFAULT '60',
  `diligence_percentage` int DEFAULT '40',
  `control_score` decimal(3,1) DEFAULT '2.5',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_score_config` (`class_id`,`semester_id`,`score_type_id`),
  KEY `semester_id` (`semester_id`),
  KEY `score_type_id` (`score_type_id`),
  CONSTRAINT `score_configs_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `score_configs_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`),
  CONSTRAINT `score_configs_ibfk_3` FOREIGN KEY (`score_type_id`) REFERENCES `score_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `score_configs`
--

LOCK TABLES `score_configs` WRITE;
/*!40000 ALTER TABLE `score_configs` DISABLE KEYS */;
INSERT INTO `score_configs` VALUES ('025a3013-22b7-48d4-9291-1969fd88bf86','c2','s1','st-thi',1,3.0,60,40,2.5,'2026-05-19 12:44:59','2026-05-19 12:44:59',NULL,NULL),('4744e89e-81d0-465a-a94c-00a8b5f21b7d','f819c480-3506-4e64-8c00-4b350b940c3d','s1','st-dag',1,1.0,60,40,2.5,'2026-05-20 15:23:15','2026-05-20 15:23:15',NULL,NULL),('8152e74e-d1d9-47f6-8bfd-68c78389ed49','f819c480-3506-4e64-8c00-4b350b940c3d','s1','st-kk',1,2.0,60,40,2.5,'2026-05-20 15:23:15','2026-05-20 15:23:15',NULL,NULL),('a920ffb4-be7d-41b8-b467-7dc7a44c1a5d','c2','s1','st-dag',1,1.0,60,40,2.5,'2026-05-19 12:44:59','2026-05-19 12:44:59',NULL,NULL),('c0410049-582c-4d58-a4ca-e8dcbca0b773','c2','s1','st-15ph',1,1.0,60,40,2.5,'2026-05-19 12:44:59','2026-05-19 12:44:59',NULL,NULL),('e1a84c22-af0a-425a-88c7-b85d26f2d3e4','c2','s1','st-kk',1,2.0,60,40,2.5,'2026-05-19 12:44:59','2026-05-19 12:44:59',NULL,NULL),('ea298788-e113-42d4-9067-3fa112fce11f','f819c480-3506-4e64-8c00-4b350b940c3d','s1','st-thi',1,3.0,60,40,2.5,'2026-05-20 15:23:15','2026-05-20 15:23:15',NULL,NULL),('ed6cecb1-d4cf-434c-94b0-7c8f7371d0b8','c2','s1','st-45ph',1,2.0,60,40,2.5,'2026-05-19 12:44:59','2026-05-19 12:44:59',NULL,NULL),('scc1','c1','s1','st-thi',1,3.0,60,40,2.5,'2026-05-14 08:29:23','2026-05-14 08:29:23',NULL,NULL);
/*!40000 ALTER TABLE `score_configs` ENABLE KEYS */;
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
