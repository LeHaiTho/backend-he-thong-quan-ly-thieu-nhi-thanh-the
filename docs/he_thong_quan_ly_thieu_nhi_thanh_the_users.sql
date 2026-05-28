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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sub_role_block_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `teacher_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `uk_users_teacher` (`teacher_id`),
  KEY `role_id` (`role_id`),
  KEY `sub_role_block_id` (`sub_role_block_id`),
  CONSTRAINT `fk_users_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`sub_role_block_id`) REFERENCES `blocks` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('5af4f421-4dba-4e1d-9d71-2c3cf1f69b8c','GVL - 2','giaovienlop2','$2b$10$mnVtxjWOP7vGItNreUc8Se7BwSFOdGLgmb3feFPf5V5lY7eTMdybm','099999999','','r4',NULL,'d24b0ff6-bcc5-43a7-b7eb-bdc41013d7ed','active',NULL,'2026-05-19 12:46:38','2026-05-20 02:08:10',NULL,NULL),('6be508d5-7464-46ce-8cf1-570c5d6327bb','GVL - 1','giaovienlop1','$2b$10$8jaxd/pUKZ0eJCqA6LSBh.46ZRZFkHL7T/ZcKqv4MPMJUBHoiaW2K','0999999999','','r4',NULL,'fef4f9e2-f659-4921-833e-f53aefe9a5d0','active',NULL,'2026-05-19 12:46:04','2026-05-20 02:08:32',NULL,NULL),('c6c7832d-90b9-4484-a2e5-e3f1bbe8c28e','Quản lý ngành Ấu nhi','quanlynganhaunhi','$2b$10$JINoM2iUKh1iqQNAXHl9j.r5fsxP.g4R8d2QQgEmcNUcQyHi7V.qS','','','r3','b2',NULL,'active',NULL,'2026-05-20 06:05:32','2026-05-20 06:05:32',NULL,NULL),('f0942e2f-b8d6-4388-9d43-f067c4f58909','Thư ký đoàn','thukydoan','$2b$10$11IL8up88qQHPDDtM0V3aOGnMILV0z5.cVUgVPWNW0WNv271Dc1vq','','','r2',NULL,NULL,'active',NULL,'2026-05-20 06:07:03','2026-05-20 06:07:03',NULL,NULL),('u1','Admin','admin','$2b$10$EIDtpZxVMWytOfT8Sd73Bul05zIMQD1slRs4F2BAmS1GeDIIxJ8a.',NULL,NULL,'r1',NULL,NULL,'active',NULL,'2026-05-14 08:29:23','2026-05-14 08:29:23',NULL,NULL),('u2','Quản lý ngành Chiên con','quanlynganhchiencon','$2b$10$qStCIogSIfKpCXpxS9ilz.cidYJBdDIImt1ST6to5GvPbzdTXUKnC',NULL,NULL,'r3','b1',NULL,'active',NULL,'2026-05-14 08:29:23','2026-05-20 06:04:54',NULL,NULL),('u3','GLV - 3','giaovienlop3','$2b$10$rpbGqgsA9Es2LE.m8LzpS.Y2UYF92d1kZuGkUVzsD5npuvIsUlbHm',NULL,NULL,'r4',NULL,'ffff5a6d-0e0a-4348-925d-099c97b03687','active',NULL,'2026-05-20 01:44:54','2026-05-20 02:08:55',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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
