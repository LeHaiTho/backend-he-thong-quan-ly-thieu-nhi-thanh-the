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
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `semester_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attendance_date` date NOT NULL,
  `attendance_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `recorded_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recorded_at` timestamp NULL DEFAULT NULL,
  `sync_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'synced',
  `d2_sync_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `semester_id` (`semester_id`),
  KEY `recorded_by` (`recorded_by`),
  KEY `idx_attendance_date` (`attendance_date`),
  KEY `idx_attendance_student` (`student_id`,`semester_id`),
  KEY `idx_attendance_class` (`class_id`,`attendance_date`),
  KEY `idx_attendance_type` (`attendance_type`),
  CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `attendance_records_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`),
  CONSTRAINT `attendance_records_ibfk_4` FOREIGN KEY (`recorded_by`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
INSERT INTO `attendance_records` VALUES ('0466efd9-5d46-4877-8620-d93c61b095e1','799e304f-af1b-4c3a-9c94-1893348e7b34','c2','s1','2026-05-19','catechism','present','12:51:59',NULL,'2026-05-19 05:51:59','synced',NULL,NULL,'2026-05-19 05:51:59','2026-05-19 12:54:59',NULL,NULL),('0dc9670b-05a2-4657-8983-44b495ab6e72','799e304f-af1b-4c3a-9c94-1893348e7b34','c2','s1','2026-05-20','mass','present','19:55:11',NULL,'2026-05-19 12:55:12','synced',NULL,NULL,'2026-05-19 12:55:12','2026-05-19 12:55:13',NULL,'2026-05-19 12:55:13'),('1a34bb2a-6bd7-4651-982a-dc8b28ed2f2b','2d798ff3-e133-4f7a-9358-e64c64e9b181','c2','s1','2026-05-19','catechism','present','12:52:00',NULL,'2026-05-19 05:52:01','synced',NULL,NULL,'2026-05-19 05:52:01','2026-05-19 05:52:01',NULL,NULL),('23598f88-f74b-4420-ad76-bdd6d4ae56cd','st2','c1','s1','2026-05-16','mass','present','16:19:58',NULL,'2026-05-16 09:19:58','synced',NULL,NULL,'2026-05-16 09:19:58','2026-05-19 04:23:49',NULL,'2026-05-19 04:23:49'),('2bcce972-b41d-4bbb-8d3b-e1ccacbbd90b','03b04515-ce70-48b3-b5c1-2074aa6f070d','c1','s1','2026-05-19','mass','present','10:47:49',NULL,'2026-05-19 03:47:49','synced',NULL,NULL,'2026-05-19 03:47:49','2026-05-19 04:23:34',NULL,'2026-05-19 04:23:34'),('3438bfda-182c-4db2-97c1-72de28936a10','03b04515-ce70-48b3-b5c1-2074aa6f070d','c1','s1','2026-05-19','mass','present','10:47:50',NULL,'2026-05-19 03:47:50','synced',NULL,NULL,'2026-05-19 03:47:50','2026-05-19 04:23:35',NULL,'2026-05-19 04:23:35'),('35e5cf7d-8eb6-4976-a7c1-dbd79bb1490d','3a5413e9-d09f-41ba-bca7-8b192e4d9f91','c1','s1','2026-05-19','mass','present','10:47:46',NULL,'2026-05-19 03:47:46','synced',NULL,NULL,'2026-05-19 03:47:46','2026-05-19 04:23:39',NULL,'2026-05-19 04:23:39'),('3f00b868-f2e1-4b47-b054-9ca76c8d85fd','03b04515-ce70-48b3-b5c1-2074aa6f070d','c1','s1','2026-05-19','mass','present','10:47:46',NULL,'2026-05-19 03:47:46','synced',NULL,NULL,'2026-05-19 03:47:46','2026-05-19 04:23:37',NULL,'2026-05-19 04:23:37'),('41305239-b9ed-42ae-93a4-9086fed704db','39851c1f-ffc9-4cb3-88c7-2270deffa2d8','c1','s1','2026-05-19','catechism','present','10:48:51',NULL,'2026-05-19 03:48:51','synced',NULL,NULL,'2026-05-19 03:48:51','2026-05-19 04:23:43',NULL,'2026-05-19 04:23:43'),('47e9dd45-a9a8-4a7e-ad8d-8861e8f0a6e9','39851c1f-ffc9-4cb3-88c7-2270deffa2d8','c1','s1','2026-05-19','mass','present','10:47:48',NULL,'2026-05-19 03:47:48','synced',NULL,NULL,'2026-05-19 03:47:48','2026-05-19 04:23:44',NULL,'2026-05-19 04:23:44'),('49770247-a69b-4b6f-9816-7c7fe8c71d0e','799e304f-af1b-4c3a-9c94-1893348e7b34','c2','s1','2026-05-19','mass','present','12:50:38',NULL,'2026-05-19 05:50:38','synced',NULL,NULL,'2026-05-19 05:50:38','2026-05-19 05:50:38',NULL,NULL),('4d92b27a-f081-482f-a8f9-7d09e4d28b5a','0541d5bb-d4d3-45cb-99cd-aa3a1ff56e20','c2','s1','2026-05-19','catechism','present','12:52:58',NULL,'2026-05-19 05:52:58','synced',NULL,NULL,'2026-05-19 05:52:58','2026-05-19 05:53:00',NULL,'2026-05-19 05:53:00'),('508572a5-a78c-4736-b9be-37a875217d1b','st1','c1','s1','2026-05-19','catechism','present','10:48:52',NULL,'2026-05-19 03:48:52','synced',NULL,NULL,'2026-05-19 03:48:52','2026-05-19 04:23:46',NULL,'2026-05-19 04:23:46'),('5b355b2c-99b8-4de1-b36c-5daa12b6996b','03b04515-ce70-48b3-b5c1-2074aa6f070d','c1','s1','2026-05-19','catechism','present','10:48:50',NULL,'2026-05-19 03:48:50','synced',NULL,NULL,'2026-05-19 03:48:50','2026-05-19 04:23:38',NULL,'2026-05-19 04:23:38'),('66bebbba-595b-41fa-8044-203c8808196c','9cd3aebe-922a-421c-912e-adc01d5dc052','c1','s1','2026-05-19','catechism','present','10:48:51',NULL,'2026-05-19 03:48:51','synced',NULL,NULL,'2026-05-19 03:48:51','2026-05-19 04:23:41',NULL,'2026-05-19 04:23:41'),('6e368513-754c-421e-8e97-1f4b962b8ba1','2d798ff3-e133-4f7a-9358-e64c64e9b181','c2','s1','2026-05-19','mass','present','12:50:45',NULL,'2026-05-19 05:50:45','synced',NULL,NULL,'2026-05-19 05:50:45','2026-05-19 05:50:45',NULL,NULL),('70872898-d101-4552-84b6-cfb6eb5420f0','9cd3aebe-922a-421c-912e-adc01d5dc052','c1','s1','2026-05-19','mass','present','10:47:47',NULL,'2026-05-19 03:47:47','synced',NULL,NULL,'2026-05-19 03:47:47','2026-05-19 04:23:42',NULL,'2026-05-19 04:23:42'),('72d8d63c-a029-4170-b0a7-23839ade842a','c7e7df1a-3880-494d-b1e9-c0dfee78e9b0','c1','s1','2026-05-19','catechism','present','10:48:52',NULL,'2026-05-19 03:48:52','synced',NULL,NULL,'2026-05-19 03:48:52','2026-05-19 04:23:45',NULL,'2026-05-19 04:23:45'),('7746584a-8afd-418c-a24a-6df67cd00157','st2','c1','s1','2026-05-19','catechism','present','10:48:53',NULL,'2026-05-19 03:48:53','synced',NULL,NULL,'2026-05-19 03:48:53','2026-05-19 04:23:47',NULL,'2026-05-19 04:23:47'),('79bb5a0f-e978-44e0-bb31-deef485fff7c','03b04515-ce70-48b3-b5c1-2074aa6f070d','c1','s1','2026-05-19','catechism','present','11:24:35',NULL,'2026-05-19 04:24:35','synced',NULL,NULL,'2026-05-19 04:24:35','2026-05-20 15:53:32',NULL,'2026-05-20 15:53:32'),('88ec0ecb-9265-43a9-b701-db16b3a4bf61','9cd3aebe-922a-421c-912e-adc01d5dc052','c1','s1','2026-05-19','catechism','present','11:24:58',NULL,'2026-05-19 04:24:58','synced',NULL,NULL,'2026-05-19 04:24:58','2026-05-20 15:53:56',NULL,'2026-05-20 15:53:56'),('98916ad4-5ad3-43fa-b1c6-32d404d3b1b1','st1','c1','s1','2026-05-16','mass','present','16:19:56',NULL,'2026-05-16 09:19:56','synced',NULL,NULL,'2026-05-16 09:19:56','2026-05-19 04:23:48',NULL,'2026-05-19 04:23:48'),('ar1','st1','c1','s1','2025-09-07','catechism','absent',NULL,NULL,NULL,'synced',NULL,NULL,'2026-05-14 08:29:23','2026-05-16 09:21:03',NULL,'2026-05-16 09:21:03'),('ar2','st2','c2','s1','2025-09-07','catechism','present',NULL,NULL,NULL,'synced',NULL,NULL,'2026-05-14 08:29:23','2026-05-14 08:29:23',NULL,NULL),('bee207c2-22c4-43cc-bd8d-c28d78dcbbc8','0541d5bb-d4d3-45cb-99cd-aa3a1ff56e20','c2','s1','2026-05-19','mass','present','12:50:46',NULL,'2026-05-19 05:50:46','synced',NULL,NULL,'2026-05-19 05:50:46','2026-05-19 05:50:46',NULL,NULL),('c2585760-b547-4b97-9ac4-97c7e540a647','32968883-d225-46d9-b974-6b9b4562c61c','c2','s1','2026-05-19','mass','present','12:50:44',NULL,'2026-05-19 05:50:44','synced',NULL,NULL,'2026-05-19 05:50:44','2026-05-19 05:50:44',NULL,NULL),('ca22fead-a449-4805-9f07-b5d4706aaaa5','799e304f-af1b-4c3a-9c94-1893348e7b34','c2','s1','2026-05-20','mass','present','19:55:15',NULL,'2026-05-19 12:55:15','synced',NULL,NULL,'2026-05-19 12:55:15','2026-05-19 12:55:16',NULL,'2026-05-19 12:55:16'),('d3ac9486-d784-41d2-bdea-808430df5e67','3a5413e9-d09f-41ba-bca7-8b192e4d9f91','c1','s1','2026-05-19','catechism','present','11:24:37',NULL,'2026-05-19 04:24:37','synced',NULL,NULL,'2026-05-19 04:24:37','2026-05-19 04:24:56',NULL,'2026-05-19 04:24:56'),('f8dc05d3-cd64-4084-9ed6-b46d8dcc3ad8','32968883-d225-46d9-b974-6b9b4562c61c','c2','s1','2026-05-19','catechism','present','12:51:59',NULL,'2026-05-19 05:51:59','synced',NULL,NULL,'2026-05-19 05:51:59','2026-05-19 05:51:59',NULL,NULL),('f991b0a3-e443-4cee-9c98-add53fbef0f1','3a5413e9-d09f-41ba-bca7-8b192e4d9f91','c1','s1','2026-05-19','catechism','present','10:48:50',NULL,'2026-05-19 03:48:50','synced',NULL,NULL,'2026-05-19 03:48:50','2026-05-19 04:23:40',NULL,'2026-05-19 04:23:40'),('f9a5deb9-a25a-4bbf-9040-657c9e0d931c','c7e7df1a-3880-494d-b1e9-c0dfee78e9b0','c1','s1','2026-05-19','catechism','present','11:25:01',NULL,'2026-05-19 04:25:01','synced',NULL,NULL,'2026-05-19 04:25:01','2026-05-19 04:25:01',NULL,NULL);
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-28 10:42:02
