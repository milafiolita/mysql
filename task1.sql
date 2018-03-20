-- MySQL dump 10.13  Distrib 5.7.21, for osx10.13 (x86_64)
--
-- Host: localhost    Database: task1
-- ------------------------------------------------------
-- Server version	5.7.21

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary table structure for view `student_chart`
--

DROP TABLE IF EXISTS `student_chart`;
/*!50001 DROP VIEW IF EXISTS `student_chart`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `student_chart` AS SELECT 
 1 AS `month`,
 1 AS `frek`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `student_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `admission_date` date DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(150) NOT NULL,
  `gender` enum('F','M') NOT NULL,
  `date_of_birth` date NOT NULL,
  `student_email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'2017-01-10','Mila Fiolita','Semarang','F','1995-06-01',NULL),(2,'2017-01-12','Septiana Adityarini','Semarang','F','1995-09-24',NULL),(3,'2017-02-02','Vika Astriani','Semarang','F','1995-03-03',NULL),(4,'2017-02-10','Reni Puji L','Solo','F','1996-05-06',NULL),(5,'2017-02-21','Rully Indra','Yogyakarta','F','1996-02-02',NULL),(6,'2017-03-08','Andre Bagus','Kediri','M','1995-03-02',NULL),(7,'2017-03-16','Tomy Soeharto','Ungaran','M','1995-11-10',NULL),(8,'2017-03-31','Hendry Ainur','Surabaya','M','1995-12-17',NULL),(9,'2017-04-22','Qisti Rahmatillah','Indramayu','F','1995-05-17',NULL),(10,'2017-04-30','Dyah Ayu','Wonogiri','F','1995-04-20',NULL),(11,'2017-05-13','Ivanda','Magelang','M','1995-08-23',NULL),(12,'2017-05-13','Tyok','Ungaran','M','1995-11-15',NULL),(13,'2017-05-13','Fandi Rahman','Kendal','M','1995-01-17',NULL),(14,'2018-03-16','Hana','Jogja','F','1995-06-13',NULL),(15,'2018-03-16','Eko','Jogja','M','1995-12-21',NULL);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `user_email` varchar(100) NOT NULL,
  `user_forgot` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','7332a33342b1f8a8ff76dd0cba71536a86c4c4a4','milafiolita01@gmail.com',NULL),(2,'rully','c4f9390950f0360df55661efde6480a73f74a25d','rullyindraa@gmail.com',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `student_chart`
--

/*!50001 DROP VIEW IF EXISTS `student_chart`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8 */;
/*!50001 SET character_set_results     = utf8 */;
/*!50001 SET collation_connection      = utf8_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `student_chart` AS select month(`students`.`admission_date`) AS `month`,count(0) AS `frek` from `students` group by `students`.`admission_date` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-03-20 11:53:50
