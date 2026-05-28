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
-- Table structure for table `attendance_configs`
--

DROP TABLE IF EXISTS `attendance_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_configs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `semester_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `day_of_week` int DEFAULT NULL,
  `is_enabled` tinyint(1) DEFAULT '0',
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `required_count` int DEFAULT '0',
  `allowed_absence` int DEFAULT '0',
  `count_all_mass_days` tinyint(1) DEFAULT '0',
  `disable_ethics_score` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_attendance_config` (`class_id`,`semester_id`,`config_type`,`day_of_week`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `attendance_configs_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `attendance_configs_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_configs`
--

LOCK TABLES `attendance_configs` WRITE;
/*!40000 ALTER TABLE `attendance_configs` DISABLE KEYS */;
INSERT INTO `attendance_configs` VALUES ('005ba78d-a780-4275-9914-0e091f8faaf1','c1','s1','mass',0,1,'04:00:00',NULL,1,1,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('08305973-9f26-4781-be75-07de85686857','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','mass',0,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('096fb512-371e-4575-9881-b2987e0a2341','c1','s1','mass',4,1,NULL,NULL,1,1,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('0f7421b8-f9cd-4129-92e2-2ae4ef3b8d8c','c1','s1','catechism',2,1,NULL,NULL,2,10,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('13f69786-0a29-48c3-b57a-154bb962bdf4','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','mass',1,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('29bf6f3b-e2b9-4549-be0e-e15d0ca2c102','c1','s1','catechism',6,1,NULL,NULL,2,10,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('32f25e42-f0af-4e25-b444-59fc39c64d5f','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','catechism',3,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('441cbfe1-271a-4cfd-b721-f74622f79748','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','mass',4,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('45f9c1a1-f922-4c0d-8cb2-e7d0b2754dca','c2','s1','catechism',2,1,NULL,NULL,1,1,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('49f77609-fed0-4b1c-862d-a7bd321c7223','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','mass',2,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('51346889-1f68-41cc-8b3a-37d2baa5c9b5','c1','s1','mass',2,1,NULL,NULL,1,1,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('56276b79-b5c7-408a-a329-b6d76add9725','c2','s1','mass',2,1,NULL,NULL,10,10,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('5a724855-b5c9-44d0-a759-3b29b54be812','c2','s1','mass',1,1,NULL,NULL,10,10,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('60237d62-4d95-4def-9237-136e88936abe','c1','s1','mass',1,1,NULL,NULL,1,1,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('6094adef-b39e-4bff-b13d-9b5919e7418d','c2','s1','mass',6,1,NULL,NULL,10,10,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('6a6e9396-3ef2-4957-a151-ef3e5d1a65db','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','catechism',6,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('6e8ff850-45b6-4763-95d4-f0c7c42e87da','c1','s1','mass',3,1,NULL,NULL,1,1,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('7a2c5686-d075-427b-9a26-c6ab8884736a','c2','s1','mass',5,1,NULL,NULL,10,10,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('7baa5a68-8ac5-4ab9-84e9-08811ea985f3','c2','s1','catechism',3,1,NULL,NULL,1,1,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('7d85c1f2-9f7e-4d73-a883-879a9a32d47c','c1','s1','catechism',0,1,'04:00:00',NULL,2,10,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('87d7754b-85a5-47c2-86d4-dd013f846608','c2','s1','catechism',4,1,NULL,NULL,1,1,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('882833e2-9c32-4d82-b6e1-636a6278bf74','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','mass',3,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('8bf1090f-9660-462b-96d4-960e7738ff5a','c2','s1','mass',4,1,NULL,NULL,10,10,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('8cf7e68f-195f-4c10-8eba-c0d22f76650d','c2','s1','catechism',0,1,NULL,NULL,1,1,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('9030b39a-8444-409e-afc7-d0691728d213','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','catechism',2,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('97801e86-b6df-4043-8c39-4c9100c9aa45','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','catechism',1,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('9d6a740e-8c1c-400e-94c2-6ea4978fde6f','c1','s1','catechism',3,1,NULL,NULL,2,10,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('a01badcf-baf1-4e1f-817f-f43ee6ed525b','c2','s1','mass',3,1,NULL,NULL,10,10,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('a74998f3-5d08-4dc8-8f38-bdec8e0e8bf4','c2','s1','mass',0,1,NULL,NULL,10,10,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('b6cf8ab5-66ad-432e-a10c-c0199c27c842','c2','s1','catechism',6,1,NULL,NULL,1,1,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('b7176a21-e1c5-4295-9845-5ead3856f068','c1','s1','catechism',1,1,NULL,NULL,2,10,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('ba68907d-86c7-4d2e-8439-4f84cf751124','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','catechism',5,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('c373564c-cc4a-4caa-a709-db12c2dfd4d0','c1','s1','mass',5,1,NULL,NULL,1,1,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('c5e53a67-959c-44f8-9a59-64771973dbec','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','mass',6,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('c77c9e01-1714-4ef7-84df-3560f82113a3','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','catechism',0,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('c7d35e0b-e109-425c-a8aa-ccf20e91bbe2','c2','s1','catechism',5,1,NULL,NULL,1,1,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL),('da3a42f8-9ca2-471a-99cb-9b861cd7c34f','c1','s1','catechism',5,1,NULL,NULL,2,10,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('de2ab72d-8be5-45b9-bc56-c5401d28eab7','c1','s1','mass',6,1,NULL,NULL,1,1,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('e7986bd6-1998-47e0-9c72-6f894c15f2d7','c1','s1','catechism',4,1,NULL,NULL,2,10,0,1,'2026-05-20 15:54:25','2026-05-20 15:54:25',NULL,NULL),('fcfb362a-f93a-44a6-8af4-60bf29ca4f50','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','mass',5,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('fd6d4e51-a3a3-4ac8-ac87-fa9282f0afb3','97e0e231-8042-48ec-82f3-ffd74ddc1352','s1','catechism',4,1,NULL,NULL,1,1,1,1,'2026-05-23 10:08:12','2026-05-23 10:08:12',NULL,NULL),('ffa8bb3b-8f58-493e-a389-6b4600e0e87e','c2','s1','catechism',1,1,NULL,NULL,1,1,1,0,'2026-05-21 02:25:27','2026-05-21 02:25:27',NULL,NULL);
/*!40000 ALTER TABLE `attendance_configs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-28 10:42:05
