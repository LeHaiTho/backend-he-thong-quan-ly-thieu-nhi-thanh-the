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
-- Table structure for table `class_transfers`
--

DROP TABLE IF EXISTS `class_transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_transfers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_class_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `from_academic_year_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_class_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_academic_year_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transfer_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transfer_date` date DEFAULT (curdate()),
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `from_class_id` (`from_class_id`),
  KEY `to_class_id` (`to_class_id`),
  KEY `from_academic_year_id` (`from_academic_year_id`),
  KEY `to_academic_year_id` (`to_academic_year_id`),
  CONSTRAINT `class_transfers_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `class_transfers_ibfk_2` FOREIGN KEY (`from_class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `class_transfers_ibfk_3` FOREIGN KEY (`to_class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `class_transfers_ibfk_4` FOREIGN KEY (`from_academic_year_id`) REFERENCES `academic_years` (`id`),
  CONSTRAINT `class_transfers_ibfk_5` FOREIGN KEY (`to_academic_year_id`) REFERENCES `academic_years` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_transfers`
--

LOCK TABLES `class_transfers` WRITE;
/*!40000 ALTER TABLE `class_transfers` DISABLE KEYS */;
INSERT INTO `class_transfers` VALUES ('027d998d-6b08-4911-9a68-181962442009','c7e7df1a-3880-494d-b1e9-c0dfee78e9b0','c1','ay2','c2','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 06:33:20','2026-05-20 06:33:20','u1',NULL),('16f4dc18-f572-4110-98f6-656e824f1b19','st_mock_10','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('2cbefbc5-670a-4d5d-b30b-33c55cd1c05c','st2','c2','ay2','c1','ay2','transfer','2026-05-14','completed',NULL,'2026-05-14 08:42:47','2026-05-14 08:42:47','u1',NULL),('34cbdab2-a0c9-48d3-83bd-396e5ee46a9b','st_mock_14','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('3c3cfc3c-b05b-4a4d-9605-563e708fff85','st_mock_09','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('3ebb937e-51fc-4736-81ad-df3db393a79d','st_mock_17','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('5ed7a846-695e-4303-b571-93628ff9da0d','st1','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('620355ca-696a-46a6-81d9-fb94bd5d2448','st_mock_02','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('646a920f-11f2-4843-bdff-c06a02c67ec5','st1','c2','ay2','c1','ay2','transfer','2026-05-14','completed',NULL,'2026-05-14 08:42:47','2026-05-14 08:42:47','u1',NULL),('72d2638e-c6dc-42b3-b828-be5e9bd1c372','st1','c1','ay2','c2','ay2','transfer','2026-05-14','completed',NULL,'2026-05-14 08:42:18','2026-05-14 08:42:18','u1',NULL),('7861d2dc-8758-4c23-ac82-80d74d0089e0','st_mock_05','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('80522d3a-3b58-4b7e-ae52-6b5683f6e02e','st_mock_06','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('85b1602d-09a7-40a0-ae1c-84412d035806','st_mock_01','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('893b8302-df67-4252-b4ef-b8a92e68f810','st_mock_04','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('9a5f3de6-8f8e-49ec-beea-f0416ccb7ac8','39851c1f-ffc9-4cb3-88c7-2270deffa2d8','c1','ay2','c2','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 06:33:20','2026-05-20 06:33:20','u1',NULL),('a4031999-e0dc-410b-bd8a-52564ad99eca','03b04515-ce70-48b3-b5c1-2074aa6f070d','c1','ay2','c2','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 06:33:20','2026-05-20 06:33:20','u1',NULL),('a61e8f9a-4c17-49c3-bd9c-86ba5572e441','st_mock_03','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('a84eada4-8d77-466f-a6dc-a664671c3a0d','st_mock_07','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('b3489382-396c-4c7b-b651-3313cf240a96','st_mock_18','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('b4010e43-2380-497f-ab1b-d955cee15e86','st_mock_08','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('b9158a81-dc6b-42bc-b643-29b331442bc0','st_mock_20','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('bcdab5a3-301a-4f89-80a3-68d477e3923e','st_mock_11','c1','ay2','b2d21a37-b3ac-412c-998e-efda30f79254','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:13:41','2026-05-20 15:13:41','u1',NULL),('c9056873-82f1-41ce-a9fd-8936cb3c5516','st_mock_13','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('ct_mock_01','st_mock_01',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_02','st_mock_02',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_03','st_mock_03',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_04','st_mock_04',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_05','st_mock_05',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_06','st_mock_06',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_07','st_mock_07',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_08','st_mock_08',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_09','st_mock_09',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_10','st_mock_10',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_11','st_mock_11',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_12','st_mock_12',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_13','st_mock_13',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_14','st_mock_14',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_15','st_mock_15',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_16','st_mock_16',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_17','st_mock_17',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_18','st_mock_18',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_19','st_mock_19',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct_mock_20','st_mock_20',NULL,NULL,'c1','ay2','new_enrollment','2026-05-20','completed',NULL,'2026-05-20 02:46:57','2026-05-20 02:46:57',NULL,NULL),('ct1','st1',NULL,NULL,'c1','ay2','new_enrollment','2026-05-14','completed',NULL,'2026-05-14 08:29:23','2026-05-14 08:29:23',NULL,NULL),('ct2','st2',NULL,NULL,'c2','ay2','new_enrollment','2026-05-14','completed',NULL,'2026-05-14 08:29:23','2026-05-14 08:29:23',NULL,NULL),('de362dce-b4fd-44b4-8286-0755d710e0ad','st_mock_15','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('e019c4dc-fa6e-47c4-9c0f-a0787b946432','st_mock_12','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('e079a3c6-b688-4198-8feb-af6fcb204706','9cd3aebe-922a-421c-912e-adc01d5dc052','c1','ay2','c2','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 06:33:20','2026-05-20 06:33:20','u1',NULL),('ed279ee5-37cb-43b2-a357-ea3bca67f96e','st_mock_19','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL),('efc03fda-67c2-42cc-85ad-27d6f3f0e48c','st_mock_16','c1','ay2','f819c480-3506-4e64-8c00-4b350b940c3d','ay2','transfer','2026-05-20','completed',NULL,'2026-05-20 15:16:30','2026-05-20 15:16:30','u1',NULL);
/*!40000 ALTER TABLE `class_transfers` ENABLE KEYS */;
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
