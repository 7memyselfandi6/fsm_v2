-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: fert
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adjusted_fert_demand_region`
--

DROP TABLE IF EXISTS `adjusted_fert_demand_region`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adjusted_fert_demand_region` (
  `afdr_id` int NOT NULL AUTO_INCREMENT,
  `year` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `region` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `zone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fert_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `adjusted_amt` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `adj_time` varchar(28) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `adjby` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`afdr_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adjusted_fert_demand_region`
--

LOCK TABLES `adjusted_fert_demand_region` WRITE;
/*!40000 ALTER TABLE `adjusted_fert_demand_region` DISABLE KEYS */;
/*!40000 ALTER TABLE `adjusted_fert_demand_region` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agri_organizations`
--

DROP TABLE IF EXISTS `agri_organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agri_organizations` (
  `orgid` int NOT NULL AUTO_INCREMENT,
  `orgname` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `abbreviation` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `website` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `facebook` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `regby` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`orgid`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agri_organizations`
--

LOCK TABLES `agri_organizations` WRITE;
/*!40000 ALTER TABLE `agri_organizations` DISABLE KEYS */;
/*!40000 ALTER TABLE `agri_organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bid_documents`
--

DROP TABLE IF EXISTS `bid_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bid_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tender_id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `document_type` varchar(150) DEFAULT NULL,
  `received_by` varchar(30) DEFAULT NULL,
  `received_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bid_documents`
--

LOCK TABLES `bid_documents` WRITE;
/*!40000 ALTER TABLE `bid_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `bid_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bid_purchases`
--

DROP TABLE IF EXISTS `bid_purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bid_purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bid_id` int NOT NULL,
  `user_id` int NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `payment_ref` varchar(200) DEFAULT NULL,
  `status` enum('pending','paid','failed') DEFAULT 'pending',
  `purchased_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bid_id` (`bid_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bid_purchases`
--

LOCK TABLES `bid_purchases` WRITE;
/*!40000 ALTER TABLE `bid_purchases` DISABLE KEYS */;
/*!40000 ALTER TABLE `bid_purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bid_receival_minutes`
--

DROP TABLE IF EXISTS `bid_receival_minutes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bid_receival_minutes` (
  `minute_id` int NOT NULL AUTO_INCREMENT,
  `tender_id` int NOT NULL,
  `bid_opening_date` datetime NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `chairperson` varchar(150) DEFAULT NULL,
  `secretary` varchar(150) DEFAULT NULL,
  `member1` varchar(150) DEFAULT NULL,
  `member2` varchar(150) DEFAULT NULL,
  `member3` varchar(150) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `document_complete` enum('Yes','No') DEFAULT 'Yes',
  `missing_documents` text,
  `bid_amount` decimal(18,2) DEFAULT NULL,
  `bid_currency` varchar(10) DEFAULT 'ETB',
  `received_by` varchar(150) DEFAULT NULL,
  `remarks` text,
  `signed_copy` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`minute_id`),
  KEY `tender_id` (`tender_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bid_receival_minutes`
--

LOCK TABLES `bid_receival_minutes` WRITE;
/*!40000 ALTER TABLE `bid_receival_minutes` DISABLE KEYS */;
/*!40000 ALTER TABLE `bid_receival_minutes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bid_team`
--

DROP TABLE IF EXISTS `bid_team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bid_team` (
  `team_id` int NOT NULL AUTO_INCREMENT,
  `tender_ref` varchar(100) NOT NULL,
  `team_name` varchar(150) NOT NULL,
  `delegation_letter` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`team_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bid_team`
--

LOCK TABLES `bid_team` WRITE;
/*!40000 ALTER TABLE `bid_team` DISABLE KEYS */;
/*!40000 ALTER TABLE `bid_team` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bid_team_members`
--

DROP TABLE IF EXISTS `bid_team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bid_team_members` (
  `member_id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `member_name` varchar(150) NOT NULL,
  `organization` varchar(150) NOT NULL,
  `role` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`member_id`),
  KEY `team_id` (`team_id`)
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bid_team_members`
--

LOCK TABLES `bid_team_members` WRITE;
/*!40000 ALTER TABLE `bid_team_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `bid_team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bid_uploads`
--

DROP TABLE IF EXISTS `bid_uploads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bid_uploads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tender_id` varchar(30) DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `upload_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bid_uploads`
--

LOCK TABLES `bid_uploads` WRITE;
/*!40000 ALTER TABLE `bid_uploads` DISABLE KEYS */;
/*!40000 ALTER TABLE `bid_uploads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bids`
--

DROP TABLE IF EXISTS `bids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bids` (
  `bev_id` int NOT NULL AUTO_INCREMENT,
  `tender_id` int NOT NULL,
  `company` varchar(200) DEFAULT NULL,
  `evaluator` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price_score` varchar(2) DEFAULT NULL,
  `tech_score` varchar(2) DEFAULT NULL,
  `experience_score` varchar(2) DEFAULT NULL,
  `total_score` varchar(3) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `evaluated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`bev_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bids`
--

LOCK TABLES `bids` WRITE;
/*!40000 ALTER TABLE `bids` DISABLE KEYS */;
/*!40000 ALTER TABLE `bids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crop_category`
--

DROP TABLE IF EXISTS `crop_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crop_category` (
  `cat_id` int NOT NULL AUTO_INCREMENT,
  `crop_category` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`cat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crop_category`
--

LOCK TABLES `crop_category` WRITE;
/*!40000 ALTER TABLE `crop_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `crop_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crop_desc`
--

DROP TABLE IF EXISTS `crop_desc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crop_desc` (
  `cid` int NOT NULL AUTO_INCREMENT,
  `crop` varchar(50) DEFAULT NULL,
  `crop_a` varchar(30) DEFAULT NULL,
  `crop_category` varchar(25) DEFAULT NULL,
  `crop_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`cid`)
) ENGINE=MyISAM AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crop_desc`
--

LOCK TABLES `crop_desc` WRITE;
/*!40000 ALTER TABLE `crop_desc` DISABLE KEYS */;
/*!40000 ALTER TABLE `crop_desc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crop_list`
--

DROP TABLE IF EXISTS `crop_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crop_list` (
  `clid` int NOT NULL AUTO_INCREMENT,
  `crop_category` int NOT NULL,
  `crop` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `urea_high_kg_ha` int DEFAULT NULL,
  `dap_high_kg_ha` int DEFAULT NULL,
  `urea_medium_kg_ha` int DEFAULT NULL,
  `dap_medium_kg_ha` int DEFAULT NULL,
  `urea_low_kg_ha` int DEFAULT NULL,
  `dap_low_kg_ha` int DEFAULT NULL,
  `active` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`clid`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crop_list`
--

LOCK TABLES `crop_list` WRITE;
/*!40000 ALTER TABLE `crop_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `crop_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `current_year`
--

DROP TABLE IF EXISTS `current_year`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `current_year` (
  `cyid` int NOT NULL AUTO_INCREMENT,
  `current_year` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active` int DEFAULT '0',
  PRIMARY KEY (`cyid`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `current_year`
--

LOCK TABLES `current_year` WRITE;
/*!40000 ALTER TABLE `current_year` DISABLE KEYS */;
/*!40000 ALTER TABLE `current_year` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `da_data`
--

DROP TABLE IF EXISTS `da_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `da_data` (
  `did` int NOT NULL AUTO_INCREMENT,
  `Salutation` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `father_name` varchar(17) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gf_name` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sex` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `academic_level` varchar(14) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `filed_of_study` varchar(53) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `job_position` varchar(49) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `region` varchar(22) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `zone` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `woreda` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `kebele` varchar(42) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`did`)
) ENGINE=MyISAM AUTO_INCREMENT=3960 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `da_data`
--

LOCK TABLES `da_data` WRITE;
/*!40000 ALTER TABLE `da_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `da_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_collector`
--

DROP TABLE IF EXISTS `data_collector`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_collector` (
  `dcid` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `reg_date` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`dcid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_collector`
--

LOCK TABLES `data_collector` WRITE;
/*!40000 ALTER TABLE `data_collector` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_collector` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `data_institutions`
--

DROP TABLE IF EXISTS `data_institutions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `data_institutions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `info_source` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `org` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `reg_by` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `attachment` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data_institutions`
--

LOCK TABLES `data_institutions` WRITE;
/*!40000 ALTER TABLE `data_institutions` DISABLE KEYS */;
/*!40000 ALTER TABLE `data_institutions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delete_pcs_final`
--

DROP TABLE IF EXISTS `delete_pcs_final`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delete_pcs_final` (
  `delpcid` int NOT NULL AUTO_INCREMENT,
  `pcid` int NOT NULL,
  `union_id` varchar(50) DEFAULT NULL,
  `cooperative_name` varchar(55) DEFAULT NULL,
  `region` varchar(10) DEFAULT NULL,
  `zone` varchar(10) DEFAULT NULL,
  `woreda` varchar(25) DEFAULT NULL,
  `kebele` varchar(29) DEFAULT NULL,
  `destination` varchar(6) NOT NULL,
  `deleted_by` varchar(25) NOT NULL,
  `deleted_date` varchar(25) NOT NULL,
  PRIMARY KEY (`delpcid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delete_pcs_final`
--

LOCK TABLES `delete_pcs_final` WRITE;
/*!40000 ALTER TABLE `delete_pcs_final` DISABLE KEYS */;
/*!40000 ALTER TABLE `delete_pcs_final` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delete_union_list`
--

DROP TABLE IF EXISTS `delete_union_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delete_union_list` (
  `delu_id` int NOT NULL AUTO_INCREMENT,
  `union_id` int NOT NULL,
  `union_name` varchar(30) DEFAULT NULL,
  `region` varchar(30) DEFAULT NULL,
  `zone` varchar(25) NOT NULL,
  `no_of_warehouse` varchar(4) NOT NULL,
  `no_of_primary_cooperatives` varchar(6) NOT NULL,
  `deleted_by` varchar(25) NOT NULL,
  `deleted_date` varchar(25) NOT NULL,
  PRIMARY KEY (`delu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delete_union_list`
--

LOCK TABLES `delete_union_list` WRITE;
/*!40000 ALTER TABLE `delete_union_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `delete_union_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deleted_list_destination`
--

DROP TABLE IF EXISTS `deleted_list_destination`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deleted_list_destination` (
  `deldestid` int NOT NULL AUTO_INCREMENT,
  `dest_id` int NOT NULL,
  `union_id` varchar(30) DEFAULT NULL,
  `destination` varchar(30) DEFAULT NULL,
  `region` varchar(30) DEFAULT NULL,
  `zone` varchar(25) NOT NULL,
  `woreda` varchar(25) NOT NULL,
  `kebele` varchar(25) NOT NULL,
  `longitude` varchar(15) DEFAULT NULL,
  `latitude` varchar(30) DEFAULT NULL,
  `altitude` varchar(8) DEFAULT NULL,
  `deleted_by` varchar(25) NOT NULL,
  `deleted_date` varchar(25) NOT NULL,
  PRIMARY KEY (`deldestid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deleted_list_destination`
--

LOCK TABLES `deleted_list_destination` WRITE;
/*!40000 ALTER TABLE `deleted_list_destination` DISABLE KEYS */;
/*!40000 ALTER TABLE `deleted_list_destination` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deleted_regions`
--

DROP TABLE IF EXISTS `deleted_regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deleted_regions` (
  `did` int NOT NULL AUTO_INCREMENT,
  `region_id` int NOT NULL,
  `region_name_e` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region_name_a` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `population` int NOT NULL,
  `area` int NOT NULL,
  `density` decimal(10,0) NOT NULL,
  `capital` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `map` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `deleted_date` varchar(26) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`did`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deleted_regions`
--

LOCK TABLES `deleted_regions` WRITE;
/*!40000 ALTER TABLE `deleted_regions` DISABLE KEYS */;
/*!40000 ALTER TABLE `deleted_regions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deleted_woredas`
--

DROP TABLE IF EXISTS `deleted_woredas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deleted_woredas` (
  `delwid` int NOT NULL AUTO_INCREMENT,
  `woreda_id` int NOT NULL,
  `woreda_name` varchar(190) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `seat` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region_id` int NOT NULL,
  `zone_id` int NOT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `deleted_date` varchar(26) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`delwid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deleted_woredas`
--

LOCK TABLES `deleted_woredas` WRITE;
/*!40000 ALTER TABLE `deleted_woredas` DISABLE KEYS */;
/*!40000 ALTER TABLE `deleted_woredas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deleted_zones`
--

DROP TABLE IF EXISTS `deleted_zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deleted_zones` (
  `dzoneid` int NOT NULL AUTO_INCREMENT,
  `zone_id` int NOT NULL,
  `zone_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `seat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region_id` int NOT NULL,
  `map` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `recTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_by` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `deleted_date` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`dzoneid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deleted_zones`
--

LOCK TABLES `deleted_zones` WRITE;
/*!40000 ALTER TABLE `deleted_zones` DISABLE KEYS */;
/*!40000 ALTER TABLE `deleted_zones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `depid` int NOT NULL AUTO_INCREMENT,
  `department` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`depid`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `distribution_channel`
--

DROP TABLE IF EXISTS `distribution_channel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `distribution_channel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `channel_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `location` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `contact_person` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `contact_number` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `distribution_channel`
--

LOCK TABLES `distribution_channel` WRITE;
/*!40000 ALTER TABLE `distribution_channel` DISABLE KEYS */;
/*!40000 ALTER TABLE `distribution_channel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eabc_cwh`
--

DROP TABLE IF EXISTS `eabc_cwh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eabc_cwh` (
  `eaid` int NOT NULL AUTO_INCREMENT,
  `center` varchar(50) NOT NULL,
  `destination` varchar(50) NOT NULL,
  `region` varchar(30) NOT NULL,
  `zone` varchar(30) NOT NULL,
  `woreda` varchar(30) NOT NULL,
  `town` varchar(50) NOT NULL,
  `year_established` varchar(30) NOT NULL,
  `Own_CWH` varchar(6) NOT NULL,
  `Rental_CWH` varchar(10) NOT NULL,
  `carrying_capacity` varchar(30) NOT NULL,
  `CWH_storeman_name` varchar(50) NOT NULL,
  `sex` varchar(10) NOT NULL,
  `level_of_education` varchar(20) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `office_availability` varchar(5) NOT NULL,
  `computer_aval` varchar(5) NOT NULL,
  `smartphone` varchar(5) NOT NULL,
  `wifi` varchar(5) NOT NULL,
  `electric` varchar(5) NOT NULL,
  `netword` varchar(5) NOT NULL,
  PRIMARY KEY (`eaid`)
) ENGINE=MyISAM AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eabc_cwh`
--

LOCK TABLES `eabc_cwh` WRITE;
/*!40000 ALTER TABLE `eabc_cwh` DISABLE KEYS */;
/*!40000 ALTER TABLE `eabc_cwh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eligibility_criteria`
--

DROP TABLE IF EXISTS `eligibility_criteria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eligibility_criteria` (
  `criteria_id` int NOT NULL AUTO_INCREMENT,
  `criteria_title` varchar(255) NOT NULL,
  `description` text,
  `category` enum('Financial','Technical','Legal','Experience','Other') DEFAULT 'Other',
  `weight` decimal(5,2) DEFAULT '0.00',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`criteria_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eligibility_criteria`
--

LOCK TABLES `eligibility_criteria` WRITE;
/*!40000 ALTER TABLE `eligibility_criteria` DISABLE KEYS */;
/*!40000 ALTER TABLE `eligibility_criteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `epy_fertilizer_subsidy`
--

DROP TABLE IF EXISTS `epy_fertilizer_subsidy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `epy_fertilizer_subsidy` (
  `eid` int NOT NULL AUTO_INCREMENT,
  `year` varchar(8) DEFAULT NULL,
  `region` int NOT NULL,
  `fert_type` varchar(30) NOT NULL,
  `amt_mt` varchar(20) NOT NULL,
  `amt_qt` varchar(20) NOT NULL,
  `price_before_subside` varchar(20) NOT NULL,
  `price_after_subsidy` varchar(20) NOT NULL,
  `updated-date` varchar(18) NOT NULL,
  `update_by` varchar(20) NOT NULL,
  PRIMARY KEY (`eid`)
) ENGINE=MyISAM AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `epy_fertilizer_subsidy`
--

LOCK TABLES `epy_fertilizer_subsidy` WRITE;
/*!40000 ALTER TABLE `epy_fertilizer_subsidy` DISABLE KEYS */;
/*!40000 ALTER TABLE `epy_fertilizer_subsidy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etho_regions`
--

DROP TABLE IF EXISTS `etho_regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `etho_regions` (
  `erid` int NOT NULL AUTO_INCREMENT,
  `country` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `region` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `zone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `woreda` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`erid`)
) ENGINE=MyISAM AUTO_INCREMENT=1144 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etho_regions`
--

LOCK TABLES `etho_regions` WRITE;
/*!40000 ALTER TABLE `etho_regions` DISABLE KEYS */;
/*!40000 ALTER TABLE `etho_regions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_autocalc_farm`
--

DROP TABLE IF EXISTS `fert_autocalc_farm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_autocalc_farm` (
  `figid` int NOT NULL AUTO_INCREMENT,
  `region` int DEFAULT '0',
  `zone` int DEFAULT '0',
  `woreda` int DEFAULT '0',
  `kebele` varchar(40) DEFAULT NULL,
  `year_season` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `farmer_id` int DEFAULT '0',
  `crop` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `land_allocated` varchar(20) DEFAULT NULL,
  `urea_requried` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dap_requried` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`figid`)
) ENGINE=MyISAM AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_autocalc_farm`
--

LOCK TABLES `fert_autocalc_farm` WRITE;
/*!40000 ALTER TABLE `fert_autocalc_farm` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_autocalc_farm` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_balance`
--

DROP TABLE IF EXISTS `fert_balance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_balance` (
  `fbid` int NOT NULL AUTO_INCREMENT,
  `pcid` int NOT NULL,
  `year` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fert_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total_received` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total_sale_accountant` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total_sale_stock` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `balance` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `last_update` varchar(28) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`fbid`)
) ENGINE=MyISAM AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_balance`
--

LOCK TABLES `fert_balance` WRITE;
/*!40000 ALTER TABLE `fert_balance` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_balance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_balance_destn`
--

DROP TABLE IF EXISTS `fert_balance_destn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_balance_destn` (
  `fbid` int NOT NULL AUTO_INCREMENT,
  `destination` int NOT NULL,
  `year` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fert_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total_received` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total_sale_accountant` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total_sale_stock` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `balance` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `last_update` varchar(28) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`fbid`)
) ENGINE=MyISAM AUTO_INCREMENT=118 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_balance_destn`
--

LOCK TABLES `fert_balance_destn` WRITE;
/*!40000 ALTER TABLE `fert_balance_destn` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_balance_destn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_demand`
--

DROP TABLE IF EXISTS `fert_demand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_demand` (
  `fert_id` int NOT NULL AUTO_INCREMENT,
  `year` varchar(8) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` int NOT NULL,
  `zone` int NOT NULL,
  `union_id` int NOT NULL,
  `destination` int NOT NULL,
  `fert_type` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `lot_no` int NOT NULL,
  `amount` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`fert_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6060 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_demand`
--

LOCK TABLES `fert_demand` WRITE;
/*!40000 ALTER TABLE `fert_demand` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_demand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_demand_allocation`
--

DROP TABLE IF EXISTS `fert_demand_allocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_demand_allocation` (
  `fal_id` int NOT NULL AUTO_INCREMENT,
  `year` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `union_id` int NOT NULL,
  `destination` int NOT NULL,
  `fert_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `lot_no` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `pcid` int NOT NULL,
  `allocated` varchar(13) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `assigned_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `assigned_date` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `approval` tinyint(1) NOT NULL,
  PRIMARY KEY (`fal_id`)
) ENGINE=MyISAM AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_demand_allocation`
--

LOCK TABLES `fert_demand_allocation` WRITE;
/*!40000 ALTER TABLE `fert_demand_allocation` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_demand_allocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_demand_approval`
--

DROP TABLE IF EXISTS `fert_demand_approval`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_demand_approval` (
  `fdaid` int NOT NULL AUTO_INCREMENT,
  `fad_id` int NOT NULL,
  `woreda_approval` int DEFAULT '0',
  `woreda_approve_by` varchar(18) DEFAULT NULL,
  `zone_approval` int NOT NULL DEFAULT '0',
  `zone_approve_by` varchar(18) DEFAULT NULL,
  `region_approval` int NOT NULL DEFAULT '0',
  `region_approve_by` varchar(18) DEFAULT NULL,
  `federal_approval` int NOT NULL DEFAULT '0',
  `federal_approve_by` varchar(18) DEFAULT NULL,
  `production_year` varchar(8) DEFAULT NULL,
  `production_season` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`fdaid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_demand_approval`
--

LOCK TABLES `fert_demand_approval` WRITE;
/*!40000 ALTER TABLE `fert_demand_approval` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_demand_approval` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_demand_reallocated`
--

DROP TABLE IF EXISTS `fert_demand_reallocated`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_demand_reallocated` (
  `fert_id` int NOT NULL AUTO_INCREMENT,
  `year` varchar(8) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` int NOT NULL,
  `zone` int NOT NULL,
  `union_id` int NOT NULL,
  `destination` int NOT NULL,
  `fert_type` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `lot_no` int NOT NULL,
  `amount` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`fert_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6060 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_demand_reallocated`
--

LOCK TABLES `fert_demand_reallocated` WRITE;
/*!40000 ALTER TABLE `fert_demand_reallocated` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_demand_reallocated` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_distn_ratio_regions`
--

DROP TABLE IF EXISTS `fert_distn_ratio_regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_distn_ratio_regions` (
  `fdrid` int NOT NULL AUTO_INCREMENT,
  `year` varchar(7) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` int NOT NULL,
  `fertilizer_type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `ratio` float NOT NULL,
  `tot_fert_required` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `meher_proportion` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `bulg_proportion` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `irrign_proportion` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `season_meher` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `season_belg` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `season_irrigation` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `reg_date` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `registerby` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`fdrid`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_distn_ratio_regions`
--

LOCK TABLES `fert_distn_ratio_regions` WRITE;
/*!40000 ALTER TABLE `fert_distn_ratio_regions` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_distn_ratio_regions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_farmers_demand`
--

DROP TABLE IF EXISTS `fert_farmers_demand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_farmers_demand` (
  `fad_id` int NOT NULL AUTO_INCREMENT,
  `far_id` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `kebele` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `woreda` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `zone` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `region` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `farmername` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `farmer_unique_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `demand_year` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `season_irrigation` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `season_meher` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `season_belg` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `fert_type` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `amount_needed_qt` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `request_date` varchar(28) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `registered_by` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval` int DEFAULT NULL,
  `approval_by` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_date` varchar(28) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`fad_id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_farmers_demand`
--

LOCK TABLES `fert_farmers_demand` WRITE;
/*!40000 ALTER TABLE `fert_farmers_demand` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_farmers_demand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_farmers_demand_det`
--

DROP TABLE IF EXISTS `fert_farmers_demand_det`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_farmers_demand_det` (
  `fad_id` int NOT NULL AUTO_INCREMENT,
  `far_id` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `kebele` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `woreda` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `zone` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `region` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `farmername` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `farmer_unique_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `demand_year` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `season_irrigation` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `season_meher` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `season_belg` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `crop_cereal` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `crop_pulse` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `crop_oils` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `crop_horti` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `crop_rootcrop` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `request_date` varchar(28) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `registered_by` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`fad_id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_farmers_demand_det`
--

LOCK TABLES `fert_farmers_demand_det` WRITE;
/*!40000 ALTER TABLE `fert_farmers_demand_det` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_farmers_demand_det` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_farmers_supply`
--

DROP TABLE IF EXISTS `fert_farmers_supply`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_farmers_supply` (
  `fad_id` int NOT NULL,
  `far_id` int NOT NULL,
  `farmername` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `farmer_unique_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `supply_year` varchar(4) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `season` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `fert_type` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `amount_supplied_qt` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `date_of_supply` varchar(28) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `registered_by` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  `approval_by` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval_date` varchar(28) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_farmers_supply`
--

LOCK TABLES `fert_farmers_supply` WRITE;
/*!40000 ALTER TABLE `fert_farmers_supply` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_farmers_supply` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_price`
--

DROP TABLE IF EXISTS `fert_price`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_price` (
  `fpid` int NOT NULL AUTO_INCREMENT,
  `union_id` int NOT NULL,
  `pcid` int NOT NULL,
  `year` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fert_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `final_price` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `date_release` varchar(28) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `set_by` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`fpid`)
) ENGINE=MyISAM AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_price`
--

LOCK TABLES `fert_price` WRITE;
/*!40000 ALTER TABLE `fert_price` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_price` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_send_dest`
--

DROP TABLE IF EXISTS `fert_send_dest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_send_dest` (
  `fsdid` int NOT NULL AUTO_INCREMENT,
  `uname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fert_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `allocated_to` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fert_amount` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `delivered_to_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `delivered_to_phone` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `truck_plate_no` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `date_transaction` varchar(28) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `send_by` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `destination` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `received` int DEFAULT '0',
  PRIMARY KEY (`fsdid`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_send_dest`
--

LOCK TABLES `fert_send_dest` WRITE;
/*!40000 ALTER TABLE `fert_send_dest` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_send_dest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fert_total_purchase_amount`
--

DROP TABLE IF EXISTS `fert_total_purchase_amount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fert_total_purchase_amount` (
  `id` int NOT NULL AUTO_INCREMENT,
  `year` varchar(7) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `fert_type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `amount_ton` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `reg_by` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `reg_date` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fert_total_purchase_amount`
--

LOCK TABLES `fert_total_purchase_amount` WRITE;
/*!40000 ALTER TABLE `fert_total_purchase_amount` DISABLE KEYS */;
/*!40000 ALTER TABLE `fert_total_purchase_amount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fertilizer_received_by_destn`
--

DROP TABLE IF EXISTS `fertilizer_received_by_destn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fertilizer_received_by_destn` (
  `frid` int NOT NULL AUTO_INCREMENT,
  `destination` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `truck_plate_no` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `truck_plate_no_trailer` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `waybill_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `operation_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `year` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fert_type` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fert_supplied_bag` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `under_weight_supplied_bag` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `kg_difference` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `final_received_qt` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `recieve_doc_number` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `delivered_by_name` varchar(65) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `delivered_by_phone` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `date_transaction` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `received_by` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`frid`)
) ENGINE=MyISAM AUTO_INCREMENT=145 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fertilizer_received_by_destn`
--

LOCK TABLES `fertilizer_received_by_destn` WRITE;
/*!40000 ALTER TABLE `fertilizer_received_by_destn` DISABLE KEYS */;
/*!40000 ALTER TABLE `fertilizer_received_by_destn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fertilizer_received_by_pc`
--

DROP TABLE IF EXISTS `fertilizer_received_by_pc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fertilizer_received_by_pc` (
  `frid` int NOT NULL AUTO_INCREMENT,
  `pcid` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `year` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fert_type` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fert_amount_on_document` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fert_amount_counted` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `delivered_by_name` varchar(65) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `delivered_by_phone` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `truck_plate_no` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_transaction` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `received_by` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`frid`)
) ENGINE=MyISAM AUTO_INCREMENT=146 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fertilizer_received_by_pc`
--

LOCK TABLES `fertilizer_received_by_pc` WRITE;
/*!40000 ALTER TABLE `fertilizer_received_by_pc` DISABLE KEYS */;
/*!40000 ALTER TABLE `fertilizer_received_by_pc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fertilizer_requirement_calc`
--

DROP TABLE IF EXISTS `fertilizer_requirement_calc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fertilizer_requirement_calc` (
  `calc_id` int NOT NULL AUTO_INCREMENT,
  `region` varchar(50) NOT NULL,
  `zone` varchar(50) NOT NULL,
  `woreda` varchar(50) NOT NULL,
  `kebele` varchar(50) NOT NULL,
  `farmer_id` varchar(50) NOT NULL,
  `farmer_name` varchar(150) DEFAULT NULL,
  `crop` varchar(50) NOT NULL,
  `crop_category` int DEFAULT NULL,
  `total_farm_area_ha` decimal(8,2) DEFAULT NULL,
  `allocated_area_ha` decimal(8,2) DEFAULT NULL,
  `potential_level` enum('high','medium','low') NOT NULL,
  `urea_rate_kg_ha` decimal(8,2) DEFAULT NULL,
  `dap_rate_kg_ha` decimal(8,2) DEFAULT NULL,
  `urea_required_kg` decimal(10,2) DEFAULT NULL,
  `dap_required_kg` decimal(10,2) DEFAULT NULL,
  `demand_year` varchar(10) DEFAULT NULL,
  `season` varchar(20) DEFAULT NULL,
  `calculated_by` varchar(50) DEFAULT NULL,
  `calculated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`calc_id`),
  KEY `region` (`region`),
  KEY `zone` (`zone`),
  KEY `woreda` (`woreda`),
  KEY `kebele` (`kebele`),
  KEY `farmer_id` (`farmer_id`),
  KEY `crop` (`crop`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fertilizer_requirement_calc`
--

LOCK TABLES `fertilizer_requirement_calc` WRITE;
/*!40000 ALTER TABLE `fertilizer_requirement_calc` DISABLE KEYS */;
/*!40000 ALTER TABLE `fertilizer_requirement_calc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fertilizer_sold`
--

DROP TABLE IF EXISTS `fertilizer_sold`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fertilizer_sold` (
  `fsid` int NOT NULL AUTO_INCREMENT,
  `transaction_code` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pcid` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `year` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fert_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `farmer_name` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `f_father_name` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `f_gf_name` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sex` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `farm_area_ha` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fert_amount` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `total_payment` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sold_by` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sold_date` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_status` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bank_transaction_id` varchar(35) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `store_approval` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `withdraw_date` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `far_approval` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `store_person` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `time_transaction_closed` varchar(28) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`fsid`)
) ENGINE=MyISAM AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fertilizer_sold`
--

LOCK TABLES `fertilizer_sold` WRITE;
/*!40000 ALTER TABLE `fertilizer_sold` DISABLE KEYS */;
/*!40000 ALTER TABLE `fertilizer_sold` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fertilizer_specifications`
--

DROP TABLE IF EXISTS `fertilizer_specifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fertilizer_specifications` (
  `spec_id` int NOT NULL AUTO_INCREMENT,
  `fert_id` int NOT NULL,
  `nutrient_content` varchar(255) DEFAULT NULL,
  `nitrogen_percent` decimal(5,2) DEFAULT NULL,
  `phosphorus_percent` decimal(5,2) DEFAULT NULL,
  `potassium_percent` decimal(5,2) DEFAULT NULL,
  `sulfur_percent` decimal(5,2) DEFAULT NULL,
  `moisture_percent` decimal(5,2) DEFAULT NULL,
  `granule_size` varchar(100) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `appearance` varchar(100) DEFAULT NULL,
  `packaging` varchar(100) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`spec_id`),
  KEY `fert_id` (`fert_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fertilizer_specifications`
--

LOCK TABLES `fertilizer_specifications` WRITE;
/*!40000 ALTER TABLE `fertilizer_specifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `fertilizer_specifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fertilizer_transactions`
--

DROP TABLE IF EXISTS `fertilizer_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fertilizer_transactions` (
  `id` int NOT NULL,
  `waybill_no` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `truck_assign_id` int NOT NULL,
  `transaction_type` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `date` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  `fertilizer_type` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `amount_on_the_document` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `quantity` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `from_location` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `to_location` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `transporter` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `plate_number` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `driver_name` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `receiver_name` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `driver_agreement` int NOT NULL,
  `datetime_driver` varchar(28) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `receiver_acceptance` int NOT NULL,
  `datetime_reciever` varchar(28) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `note` text CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  `approval_by` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approved_datetime` varchar(28) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fertilizer_transactions`
--

LOCK TABLES `fertilizer_transactions` WRITE;
/*!40000 ALTER TABLE `fertilizer_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `fertilizer_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fertilizer_type`
--

DROP TABLE IF EXISTS `fertilizer_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fertilizer_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fertilizer_type` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `type_all_name` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `note` text CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `used` int NOT NULL,
  `picture` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fertilizer_type`
--

LOCK TABLES `fertilizer_type` WRITE;
/*!40000 ALTER TABLE `fertilizer_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `fertilizer_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fertilizer_types`
--

DROP TABLE IF EXISTS `fertilizer_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fertilizer_types` (
  `fert_id` int NOT NULL AUTO_INCREMENT,
  `fert_name` varchar(100) NOT NULL,
  `fert_source` varchar(100) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`fert_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fertilizer_types`
--

LOCK TABLES `fertilizer_types` WRITE;
/*!40000 ALTER TABLE `fertilizer_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `fertilizer_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_position`
--

DROP TABLE IF EXISTS `job_position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_position` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dep` int NOT NULL,
  `job_position_name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `organization_name` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_position`
--

LOCK TABLES `job_position` WRITE;
/*!40000 ALTER TABLE `job_position` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_position` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kebele`
--

DROP TABLE IF EXISTS `kebele`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kebele` (
  `kebele_id` int NOT NULL AUTO_INCREMENT,
  `kebele_name` varchar(150) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `zone` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `woreda_id` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`kebele_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4272 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kebele`
--

LOCK TABLES `kebele` WRITE;
/*!40000 ALTER TABLE `kebele` DISABLE KEYS */;
/*!40000 ALTER TABLE `kebele` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kebele_fert_demand_summary`
--

DROP TABLE IF EXISTS `kebele_fert_demand_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kebele_fert_demand_summary` (
  `kfdid` int NOT NULL AUTO_INCREMENT,
  `kebele` varchar(50) NOT NULL,
  `woreda` int NOT NULL,
  `zone` int NOT NULL,
  `region` int NOT NULL,
  `year_season` varchar(30) NOT NULL,
  `fert_type` varchar(25) NOT NULL,
  `demand_collected` varchar(20) NOT NULL,
  `demand_intellegence` varchar(20) NOT NULL,
  `demand_adjusted_by_kebele` varchar(20) NOT NULL,
  `demand_adjusted_by_woreda` varchar(20) NOT NULL,
  `stop_adjustment` int NOT NULL,
  PRIMARY KEY (`kfdid`)
) ENGINE=MyISAM AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kebele_fert_demand_summary`
--

LOCK TABLES `kebele_fert_demand_summary` WRITE;
/*!40000 ALTER TABLE `kebele_fert_demand_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `kebele_fert_demand_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `language`
--

DROP TABLE IF EXISTS `language`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `language` (
  `lid` int NOT NULL AUTO_INCREMENT,
  `language` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`lid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `language`
--

LOCK TABLES `language` WRITE;
/*!40000 ALTER TABLE `language` DISABLE KEYS */;
/*!40000 ALTER TABLE `language` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_destination`
--

DROP TABLE IF EXISTS `list_destination`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_destination` (
  `dest_id` int NOT NULL AUTO_INCREMENT,
  `union_id` varchar(30) DEFAULT NULL,
  `destination` varchar(30) DEFAULT NULL,
  `region` varchar(30) DEFAULT NULL,
  `zone` varchar(25) NOT NULL,
  `woreda` varchar(25) NOT NULL,
  `kebele` varchar(25) NOT NULL,
  `longitude` varchar(15) DEFAULT NULL,
  `latitude` varchar(30) DEFAULT NULL,
  `altitude` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`dest_id`)
) ENGINE=InnoDB AUTO_INCREMENT=177 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_destination`
--

LOCK TABLES `list_destination` WRITE;
/*!40000 ALTER TABLE `list_destination` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_destination` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_destination_members`
--

DROP TABLE IF EXISTS `list_destination_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_destination_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `destid` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `union_id` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `zone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(90) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `position` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `id_card` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `picture` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_destination_members`
--

LOCK TABLES `list_destination_members` WRITE;
/*!40000 ALTER TABLE `list_destination_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_destination_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_destination_old`
--

DROP TABLE IF EXISTS `list_destination_old`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_destination_old` (
  `dest_id` int NOT NULL AUTO_INCREMENT,
  `union_id` varchar(30) DEFAULT NULL,
  `destination` varchar(30) DEFAULT NULL,
  `region` varchar(30) DEFAULT NULL,
  `zone` varchar(25) NOT NULL,
  `woreda` varchar(25) NOT NULL,
  `kebele` varchar(25) NOT NULL,
  `longitude` varchar(15) DEFAULT NULL,
  `latitude` varchar(30) DEFAULT NULL,
  `altitude` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`dest_id`)
) ENGINE=InnoDB AUTO_INCREMENT=164 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_destination_old`
--

LOCK TABLES `list_destination_old` WRITE;
/*!40000 ALTER TABLE `list_destination_old` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_destination_old` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_investors_members`
--

DROP TABLE IF EXISTS `list_investors_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_investors_members` (
  `id` int NOT NULL,
  `company_name` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `fullname` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `zone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `woreda` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `kebele` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `position` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `branch_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `id_no` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `picture` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_investors_members`
--

LOCK TABLES `list_investors_members` WRITE;
/*!40000 ALTER TABLE `list_investors_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_investors_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_of_farmers_fertilizer`
--

DROP TABLE IF EXISTS `list_of_farmers_fertilizer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_of_farmers_fertilizer` (
  `far_id` int NOT NULL AUTO_INCREMENT,
  `farmername` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `sex` varchar(7) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `photo` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `mobile_number` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `region` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `zone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `woreda` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `kebele` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `address` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `farm_area_ha` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `land_certificate_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `registered_by` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `registered_date` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `reg_method` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval` int DEFAULT '0',
  `approval_by` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_date` varchar(28) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`far_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100000084 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_of_farmers_fertilizer`
--

LOCK TABLES `list_of_farmers_fertilizer` WRITE;
/*!40000 ALTER TABLE `list_of_farmers_fertilizer` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_of_farmers_fertilizer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_of_kebele_members`
--

DROP TABLE IF EXISTS `list_of_kebele_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_of_kebele_members` (
  `km_id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `picture` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `zone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `woreda` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `kebele` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `address` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `position` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `idscan` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`km_id`)
) ENGINE=InnoDB AUTO_INCREMENT=137 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_of_kebele_members`
--

LOCK TABLES `list_of_kebele_members` WRITE;
/*!40000 ALTER TABLE `list_of_kebele_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_of_kebele_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_of_region_members`
--

DROP TABLE IF EXISTS `list_of_region_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_of_region_members` (
  `zm_id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `picture` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `address` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `username` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `department` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `position` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `id_no` varchar(16) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `idscan` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `unicode` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`zm_id`)
) ENGINE=InnoDB AUTO_INCREMENT=137 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_of_region_members`
--

LOCK TABLES `list_of_region_members` WRITE;
/*!40000 ALTER TABLE `list_of_region_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_of_region_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_of_trucks`
--

DROP TABLE IF EXISTS `list_of_trucks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_of_trucks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transporter_id` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `truck_model` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `type` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `carrying_capacity` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `plate_number` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `plate_number_back` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `driver_name` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `driver_licence_number` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `status` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_of_trucks`
--

LOCK TABLES `list_of_trucks` WRITE;
/*!40000 ALTER TABLE `list_of_trucks` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_of_trucks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_of_woreda_members`
--

DROP TABLE IF EXISTS `list_of_woreda_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_of_woreda_members` (
  `wm_id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `picture` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `zone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `woreda` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `address` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `department` varchar(75) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `position` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `idscan` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`wm_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_of_woreda_members`
--

LOCK TABLES `list_of_woreda_members` WRITE;
/*!40000 ALTER TABLE `list_of_woreda_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_of_woreda_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_of_zone_members`
--

DROP TABLE IF EXISTS `list_of_zone_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_of_zone_members` (
  `zm_id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `id_no` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `picture` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `mobile` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `zone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `region` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `address` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `department` varchar(35) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `position` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `unicode` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `idscan` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`zm_id`)
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_of_zone_members`
--

LOCK TABLES `list_of_zone_members` WRITE;
/*!40000 ALTER TABLE `list_of_zone_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_of_zone_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_pc_members`
--

DROP TABLE IF EXISTS `list_pc_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_pc_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pcid` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` int NOT NULL,
  `zone` int NOT NULL,
  `woreda` int NOT NULL,
  `union_id` int NOT NULL,
  `fullname` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `mobile` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `position` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `id_no` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `picture` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_pc_members`
--

LOCK TABLES `list_pc_members` WRITE;
/*!40000 ALTER TABLE `list_pc_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_pc_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_transporter`
--

DROP TABLE IF EXISTS `list_transporter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_transporter` (
  `tranid` int NOT NULL AUTO_INCREMENT,
  `transporter_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `zone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `woreda` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `phone` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `manager_name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`tranid`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_transporter`
--

LOCK TABLES `list_transporter` WRITE;
/*!40000 ALTER TABLE `list_transporter` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_transporter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_transporter_members`
--

DROP TABLE IF EXISTS `list_transporter_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_transporter_members` (
  `pmid` int NOT NULL AUTO_INCREMENT,
  `transporter_name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `fullname` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `position` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `branch_name` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `zone` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `woreda` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `kebele` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `id_no` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `id_card` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `photo` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `regdate` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `status` int NOT NULL,
  PRIMARY KEY (`pmid`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_transporter_members`
--

LOCK TABLES `list_transporter_members` WRITE;
/*!40000 ALTER TABLE `list_transporter_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_transporter_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_unions_members`
--

DROP TABLE IF EXISTS `list_unions_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_unions_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `union_name` varchar(35) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `zone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(90) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `position` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `id_card` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `picture` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_unions_members`
--

LOCK TABLES `list_unions_members` WRITE;
/*!40000 ALTER TABLE `list_unions_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `list_unions_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logininfo`
--

DROP TABLE IF EXISTS `logininfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logininfo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `datetime` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19276 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logininfo`
--

LOCK TABLES `logininfo` WRITE;
/*!40000 ALTER TABLE `logininfo` DISABLE KEYS */;
/*!40000 ALTER TABLE `logininfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logininfo_company`
--

DROP TABLE IF EXISTS `logininfo_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logininfo_company` (
  `lid` int NOT NULL AUTO_INCREMENT,
  `name` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `datetime` int NOT NULL,
  PRIMARY KEY (`lid`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logininfo_company`
--

LOCK TABLES `logininfo_company` WRITE;
/*!40000 ALTER TABLE `logininfo_company` DISABLE KEYS */;
/*!40000 ALTER TABLE `logininfo_company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moa_date`
--

DROP TABLE IF EXISTS `moa_date`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moa_date` (
  `mdid` int NOT NULL AUTO_INCREMENT,
  `date` varchar(2) NOT NULL,
  `active` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`mdid`)
) ENGINE=MyISAM AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moa_date`
--

LOCK TABLES `moa_date` WRITE;
/*!40000 ALTER TABLE `moa_date` DISABLE KEYS */;
/*!40000 ALTER TABLE `moa_date` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moa_desks`
--

DROP TABLE IF EXISTS `moa_desks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moa_desks` (
  `mid` int NOT NULL AUTO_INCREMENT,
  `stateminister` int NOT NULL,
  `executive` int NOT NULL,
  `desk_e` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `desk_a` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `img` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`mid`)
) ENGINE=InnoDB AUTO_INCREMENT=952 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moa_desks`
--

LOCK TABLES `moa_desks` WRITE;
/*!40000 ALTER TABLE `moa_desks` DISABLE KEYS */;
/*!40000 ALTER TABLE `moa_desks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moa_executives`
--

DROP TABLE IF EXISTS `moa_executives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moa_executives` (
  `exid` int NOT NULL AUTO_INCREMENT,
  `Stateminister` int NOT NULL,
  `executive` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `executive_a` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `pic` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`exid`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moa_executives`
--

LOCK TABLES `moa_executives` WRITE;
/*!40000 ALTER TABLE `moa_executives` DISABLE KEYS */;
/*!40000 ALTER TABLE `moa_executives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moa_fert_demand_summary`
--

DROP TABLE IF EXISTS `moa_fert_demand_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moa_fert_demand_summary` (
  `mfdid` int NOT NULL AUTO_INCREMENT,
  `year_season` varchar(30) NOT NULL,
  `fert_type` varchar(25) NOT NULL,
  `demand_collected` varchar(20) NOT NULL,
  `demand_intellegence` varchar(20) NOT NULL,
  `demand_adjusted_by_region` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `demand_adjusted_by_moa` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `stop_adjustment` int NOT NULL,
  PRIMARY KEY (`mfdid`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moa_fert_demand_summary`
--

LOCK TABLES `moa_fert_demand_summary` WRITE;
/*!40000 ALTER TABLE `moa_fert_demand_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `moa_fert_demand_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moa_month`
--

DROP TABLE IF EXISTS `moa_month`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moa_month` (
  `mid` int NOT NULL AUTO_INCREMENT,
  `month` varchar(10) DEFAULT NULL,
  `active` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`mid`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moa_month`
--

LOCK TABLES `moa_month` WRITE;
/*!40000 ALTER TABLE `moa_month` DISABLE KEYS */;
/*!40000 ALTER TABLE `moa_month` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moa_month_minute`
--

DROP TABLE IF EXISTS `moa_month_minute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moa_month_minute` (
  `mid` int NOT NULL AUTO_INCREMENT,
  `month` varchar(10) DEFAULT NULL,
  `active` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`mid`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moa_month_minute`
--

LOCK TABLES `moa_month_minute` WRITE;
/*!40000 ALTER TABLE `moa_month_minute` DISABLE KEYS */;
/*!40000 ALTER TABLE `moa_month_minute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `moa_sectors`
--

DROP TABLE IF EXISTS `moa_sectors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moa_sectors` (
  `secid` int NOT NULL AUTO_INCREMENT,
  `sector_name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `sector_name_e` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`secid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `moa_sectors`
--

LOCK TABLES `moa_sectors` WRITE;
/*!40000 ALTER TABLE `moa_sectors` DISABLE KEYS */;
/*!40000 ALTER TABLE `moa_sectors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mobapp_install`
--

DROP TABLE IF EXISTS `mobapp_install`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobapp_install` (
  `mid` int NOT NULL AUTO_INCREMENT,
  `user` varchar(30) DEFAULT NULL,
  `application` varchar(20) DEFAULT NULL,
  `when_install` varchar(30) NOT NULL,
  PRIMARY KEY (`mid`)
) ENGINE=MyISAM AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mobapp_install`
--

LOCK TABLES `mobapp_install` WRITE;
/*!40000 ALTER TABLE `mobapp_install` DISABLE KEYS */;
/*!40000 ALTER TABLE `mobapp_install` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `month`
--

DROP TABLE IF EXISTS `month`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `month` (
  `mid` int NOT NULL AUTO_INCREMENT,
  `month_a` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `month_e` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`mid`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `month`
--

LOCK TABLES `month` WRITE;
/*!40000 ALTER TABLE `month` DISABLE KEYS */;
/*!40000 ALTER TABLE `month` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_fert_1`
--

DROP TABLE IF EXISTS `otp_fert_1`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_fert_1` (
  `fmid` int NOT NULL AUTO_INCREMENT,
  `mobile` varchar(15) NOT NULL,
  `otp` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `used` int NOT NULL,
  `timeset` varchar(27) NOT NULL,
  PRIMARY KEY (`fmid`)
) ENGINE=MyISAM AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_fert_1`
--

LOCK TABLES `otp_fert_1` WRITE;
/*!40000 ALTER TABLE `otp_fert_1` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp_fert_1` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partner_organization_fertilizer`
--

DROP TABLE IF EXISTS `partner_organization_fertilizer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partner_organization_fertilizer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_of_organization` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `city_region` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `zone_subcity` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `woreda` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `phone_number` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `website` varchar(150) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partner_organization_fertilizer`
--

LOCK TABLES `partner_organization_fertilizer` WRITE;
/*!40000 ALTER TABLE `partner_organization_fertilizer` DISABLE KEYS */;
/*!40000 ALTER TABLE `partner_organization_fertilizer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pcs_final`
--

DROP TABLE IF EXISTS `pcs_final`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pcs_final` (
  `pcid` int NOT NULL AUTO_INCREMENT,
  `union_id` varchar(50) DEFAULT NULL,
  `cooperative_name` varchar(55) DEFAULT NULL,
  `region` varchar(10) DEFAULT NULL,
  `zone` varchar(10) DEFAULT NULL,
  `woreda` varchar(25) DEFAULT NULL,
  `kebele` varchar(29) DEFAULT NULL,
  `destination` varchar(6) NOT NULL,
  PRIMARY KEY (`pcid`)
) ENGINE=InnoDB AUTO_INCREMENT=4274 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pcs_final`
--

LOCK TABLES `pcs_final` WRITE;
/*!40000 ALTER TABLE `pcs_final` DISABLE KEYS */;
/*!40000 ALTER TABLE `pcs_final` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procurement_selection`
--

DROP TABLE IF EXISTS `procurement_selection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procurement_selection` (
  `selection_id` int NOT NULL AUTO_INCREMENT,
  `tender_id` int NOT NULL,
  `method` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `selected_companies` text,
  `selected_supplier_id` varchar(20) DEFAULT NULL,
  `decision_minute` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `decision_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`selection_id`),
  KEY `bid_id` (`tender_id`)
) ENGINE=MyISAM AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procurement_selection`
--

LOCK TABLES `procurement_selection` WRITE;
/*!40000 ALTER TABLE `procurement_selection` DISABLE KEYS */;
/*!40000 ALTER TABLE `procurement_selection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_followup`
--

DROP TABLE IF EXISTS `purchase_followup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_followup` (
  `id` int NOT NULL,
  `requested_by` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `requested_type` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `req_qty` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `req_date` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `item_delivered_by` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `item_qty` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `delivered_date` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `receipt_no` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `unit_price` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `total_price` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `pay_day_time` date NOT NULL,
  `receiver_signature` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `receiver_name` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_followup`
--

LOCK TABLES `purchase_followup` WRITE;
/*!40000 ALTER TABLE `purchase_followup` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchase_followup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rand_farmer`
--

DROP TABLE IF EXISTS `rand_farmer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rand_farmer` (
  `rfid` int NOT NULL AUTO_INCREMENT,
  `random` varchar(8) NOT NULL,
  `created_at` varchar(16) NOT NULL,
  `created_by` varchar(12) NOT NULL,
  PRIMARY KEY (`rfid`)
) ENGINE=MyISAM AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rand_farmer`
--

LOCK TABLES `rand_farmer` WRITE;
/*!40000 ALTER TABLE `rand_farmer` DISABLE KEYS */;
/*!40000 ALTER TABLE `rand_farmer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `region_fert_demand_summary`
--

DROP TABLE IF EXISTS `region_fert_demand_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `region_fert_demand_summary` (
  `rfdid` int NOT NULL AUTO_INCREMENT,
  `region` int NOT NULL,
  `year_season` varchar(30) NOT NULL,
  `fert_type` varchar(25) NOT NULL,
  `demand_collected` varchar(20) NOT NULL,
  `demand_intellegence` varchar(20) NOT NULL,
  `demand_adjusted_by_zone` varchar(30) NOT NULL,
  `demand_adjusted_by_region` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `demand_adjusted_by_moa` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `stop_adjustment` int NOT NULL,
  PRIMARY KEY (`rfdid`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `region_fert_demand_summary`
--

LOCK TABLES `region_fert_demand_summary` WRITE;
/*!40000 ALTER TABLE `region_fert_demand_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `region_fert_demand_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regions`
--

DROP TABLE IF EXISTS `regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regions` (
  `region_id` int NOT NULL AUTO_INCREMENT,
  `region_name_e` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region_name_a` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `population` int NOT NULL,
  `area` int NOT NULL,
  `density` decimal(10,0) NOT NULL,
  `capital` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `map` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `flag` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `timestamp` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`region_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regions`
--

LOCK TABLES `regions` WRITE;
/*!40000 ALTER TABLE `regions` DISABLE KEYS */;
/*!40000 ALTER TABLE `regions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shmagle`
--

DROP TABLE IF EXISTS `shmagle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shmagle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `union` varchar(32) NOT NULL,
  `region` varchar(60) NOT NULL,
  `zone` varchar(50) NOT NULL,
  `woreda` varchar(60) NOT NULL,
  `kebele` varchar(60) NOT NULL,
  `latitude` varchar(80) NOT NULL,
  `longitude` varchar(90) NOT NULL,
  `altitude` varchar(80) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=295 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shmagle`
--

LOCK TABLES `shmagle` WRITE;
/*!40000 ALTER TABLE `shmagle` DISABLE KEYS */;
/*!40000 ALTER TABLE `shmagle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_organization_list`
--

DROP TABLE IF EXISTS `staff_organization_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_organization_list` (
  `st_org_id` int NOT NULL AUTO_INCREMENT,
  `organization_name` varchar(175) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `staff_fullname` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `position` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `id_no` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(14) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `photo` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`st_org_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_organization_list`
--

LOCK TABLES `staff_organization_list` WRITE;
/*!40000 ALTER TABLE `staff_organization_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_organization_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supad_login`
--

DROP TABLE IF EXISTS `supad_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supad_login` (
  `lgid` int NOT NULL AUTO_INCREMENT,
  `date` varchar(30) DEFAULT NULL,
  `otp` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`lgid`)
) ENGINE=MyISAM AUTO_INCREMENT=317 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supad_login`
--

LOCK TABLES `supad_login` WRITE;
/*!40000 ALTER TABLE `supad_login` DISABLE KEYS */;
/*!40000 ALTER TABLE `supad_login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `super_admin`
--

DROP TABLE IF EXISTS `super_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `super_admin` (
  `said` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `recdate` varchar(26) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`said`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `super_admin`
--

LOCK TABLES `super_admin` WRITE;
/*!40000 ALTER TABLE `super_admin` DISABLE KEYS */;
/*!40000 ALTER TABLE `super_admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_feedback_collection`
--

DROP TABLE IF EXISTS `system_feedback_collection`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_feedback_collection` (
  `sfid` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `which_system` varchar(150) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `comment` text CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci,
  `criticality` varchar(8) COLLATE utf8mb3_unicode_ci NOT NULL,
  `regtime` varchar(26) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`sfid`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_feedback_collection`
--

LOCK TABLES `system_feedback_collection` WRITE;
/*!40000 ALTER TABLE `system_feedback_collection` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_feedback_collection` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_requisition_commercial`
--

DROP TABLE IF EXISTS `tbl_requisition_commercial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_requisition_commercial` (
  `req_id` int NOT NULL,
  `farm_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `investor_name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `season` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `type_of_crop_sown` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `req_fert_type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `req_fert_qty` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `date_requested` date NOT NULL,
  `remark` text CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_requisition_commercial`
--

LOCK TABLES `tbl_requisition_commercial` WRITE;
/*!40000 ALTER TABLE `tbl_requisition_commercial` DISABLE KEYS */;
/*!40000 ALTER TABLE `tbl_requisition_commercial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tender_budget_confirmations`
--

DROP TABLE IF EXISTS `tender_budget_confirmations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tender_budget_confirmations` (
  `confirmation_id` int NOT NULL AUTO_INCREMENT,
  `tender_id` int NOT NULL,
  `approved_budget` decimal(18,2) NOT NULL,
  `approval_date` date NOT NULL,
  `budget_letter` varchar(255) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`confirmation_id`),
  KEY `tender_id` (`tender_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tender_budget_confirmations`
--

LOCK TABLES `tender_budget_confirmations` WRITE;
/*!40000 ALTER TABLE `tender_budget_confirmations` DISABLE KEYS */;
/*!40000 ALTER TABLE `tender_budget_confirmations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenders`
--

DROP TABLE IF EXISTS `tenders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenders` (
  `tender_id` int NOT NULL AUTO_INCREMENT,
  `tender_ref` varchar(100) NOT NULL,
  `fiscal_year` varchar(10) NOT NULL,
  `fert_type` varchar(100) NOT NULL,
  `region` varchar(100) NOT NULL,
  `total_est_budget` decimal(18,2) DEFAULT '0.00',
  `tender_title` varchar(255) DEFAULT NULL,
  `issue_date` varchar(28) DEFAULT NULL,
  `closing_date` varchar(28) DEFAULT NULL,
  `status` enum('Draft','Open','Closed','Awarded','Cancelled') DEFAULT 'Draft',
  `tender_file` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `procurement_method` varchar(100) DEFAULT NULL,
  `published` tinyint(1) DEFAULT '0',
  `publish_date` datetime DEFAULT NULL,
  `document_price` varchar(18) NOT NULL DEFAULT '2000',
  PRIMARY KEY (`tender_id`),
  UNIQUE KEY `tender_ref` (`tender_ref`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenders`
--

LOCK TABLES `tenders` WRITE;
/*!40000 ALTER TABLE `tenders` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `truck_assignment`
--

DROP TABLE IF EXISTS `truck_assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `truck_assignment` (
  `tas_id` int NOT NULL AUTO_INCREMENT,
  `transporter_name` varchar(60) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `truck_plate_no` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `driver` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `region` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `union_name` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `destination` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `date_assignment` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `status` int NOT NULL,
  PRIMARY KEY (`tas_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `truck_assignment`
--

LOCK TABLES `truck_assignment` WRITE;
/*!40000 ALTER TABLE `truck_assignment` DISABLE KEYS */;
/*!40000 ALTER TABLE `truck_assignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `truck_model`
--

DROP TABLE IF EXISTS `truck_model`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `truck_model` (
  `tmid` int NOT NULL AUTO_INCREMENT,
  `model_name` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`tmid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `truck_model`
--

LOCK TABLES `truck_model` WRITE;
/*!40000 ALTER TABLE `truck_model` DISABLE KEYS */;
/*!40000 ALTER TABLE `truck_model` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `truck_tracking`
--

DROP TABLE IF EXISTS `truck_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `truck_tracking` (
  `ttid` int NOT NULL AUTO_INCREMENT,
  `truck_plate_no` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `driver` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `checkpoint` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `destination` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `arrived_at` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `dispatched_at` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `datetime` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `status` int NOT NULL,
  `note` text CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`ttid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `truck_tracking`
--

LOCK TABLES `truck_tracking` WRITE;
/*!40000 ALTER TABLE `truck_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `truck_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `truck_type`
--

DROP TABLE IF EXISTS `truck_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `truck_type` (
  `ttid` int NOT NULL AUTO_INCREMENT,
  `truck_type` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`ttid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `truck_type`
--

LOCK TABLES `truck_type` WRITE;
/*!40000 ALTER TABLE `truck_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `truck_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `union_list`
--

DROP TABLE IF EXISTS `union_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `union_list` (
  `union_id` int NOT NULL AUTO_INCREMENT,
  `union_name` varchar(50) DEFAULT NULL,
  `region` varchar(30) DEFAULT NULL,
  `zone` varchar(25) NOT NULL,
  `no_of_warehouse` varchar(4) NOT NULL,
  `no_of_primary_cooperatives` varchar(6) NOT NULL,
  PRIMARY KEY (`union_id`)
) ENGINE=InnoDB AUTO_INCREMENT=175 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `union_list`
--

LOCK TABLES `union_list` WRITE;
/*!40000 ALTER TABLE `union_list` DISABLE KEYS */;
/*!40000 ALTER TABLE `union_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `union_list_new`
--

DROP TABLE IF EXISTS `union_list_new`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `union_list_new` (
  `union_id` int NOT NULL AUTO_INCREMENT,
  `union_name` varchar(30) DEFAULT NULL,
  `region` varchar(30) DEFAULT NULL,
  `zone` varchar(25) NOT NULL,
  `woreda` varchar(25) NOT NULL,
  `kebele` varchar(30) NOT NULL,
  `no_of_warehouse` varchar(4) NOT NULL,
  `no_of_primary_cooperatives` varchar(6) NOT NULL,
  `longitude` varchar(15) DEFAULT NULL,
  `latitude` varchar(30) DEFAULT NULL,
  `altitude` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`union_id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `union_list_new`
--

LOCK TABLES `union_list_new` WRITE;
/*!40000 ALTER TABLE `union_list_new` DISABLE KEYS */;
/*!40000 ALTER TABLE `union_list_new` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_of_measure`
--

DROP TABLE IF EXISTS `unit_of_measure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_of_measure` (
  `id` int NOT NULL AUTO_INCREMENT,
  `unit` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_of_measure`
--

LOCK TABLES `unit_of_measure` WRITE;
/*!40000 ALTER TABLE `unit_of_measure` DISABLE KEYS */;
/*!40000 ALTER TABLE `unit_of_measure` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_login`
--

DROP TABLE IF EXISTS `user_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_login` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_login`
--

LOCK TABLES `user_login` WRITE;
/*!40000 ALTER TABLE `user_login` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_stakeholder`
--

DROP TABLE IF EXISTS `user_stakeholder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_stakeholder` (
  `usid` int NOT NULL AUTO_INCREMENT,
  `stakeholder` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `fullname` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `position` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `username` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT 'invest',
  `ini_password` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT '123',
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  `registerby` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`usid`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_stakeholder`
--

LOCK TABLES `user_stakeholder` WRITE;
/*!40000 ALTER TABLE `user_stakeholder` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_stakeholder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_customers`
--

DROP TABLE IF EXISTS `users_customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_customers` (
  `ucid` int NOT NULL AUTO_INCREMENT,
  `company` varchar(100) DEFAULT NULL,
  `fullname` varchar(50) DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `email` varchar(80) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `photo` varchar(255) NOT NULL,
  `approval` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ucid`)
) ENGINE=MyISAM AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_customers`
--

LOCK TABLES `users_customers` WRITE;
/*!40000 ALTER TABLE `users_customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_destination_fert`
--

DROP TABLE IF EXISTS `users_destination_fert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_destination_fert` (
  `uufid` int NOT NULL AUTO_INCREMENT,
  `dest_id` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`uufid`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_destination_fert`
--

LOCK TABLES `users_destination_fert` WRITE;
/*!40000 ALTER TABLE `users_destination_fert` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_destination_fert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_eabc`
--

DROP TABLE IF EXISTS `users_eabc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_eabc` (
  `ueid` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(60) DEFAULT NULL,
  `username` varchar(15) DEFAULT NULL,
  `role` varchar(35) DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `email` varchar(80) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `approval` int NOT NULL DEFAULT '0',
  `registered_at` varchar(28) DEFAULT NULL,
  PRIMARY KEY (`ueid`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_eabc`
--

LOCK TABLES `users_eabc` WRITE;
/*!40000 ALTER TABLE `users_eabc` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_eabc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_farmers_fert`
--

DROP TABLE IF EXISTS `users_farmers_fert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_farmers_fert` (
  `uffid` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`uffid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_farmers_fert`
--

LOCK TABLES `users_farmers_fert` WRITE;
/*!40000 ALTER TABLE `users_farmers_fert` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_farmers_fert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_investors_fert`
--

DROP TABLE IF EXISTS `users_investors_fert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_investors_fert` (
  `uifid` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`uifid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_investors_fert`
--

LOCK TABLES `users_investors_fert` WRITE;
/*!40000 ALTER TABLE `users_investors_fert` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_investors_fert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_kebele_staff_fert`
--

DROP TABLE IF EXISTS `users_kebele_staff_fert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_kebele_staff_fert` (
  `upcfid` int NOT NULL AUTO_INCREMENT,
  `pc` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`upcfid`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_kebele_staff_fert`
--

LOCK TABLES `users_kebele_staff_fert` WRITE;
/*!40000 ALTER TABLE `users_kebele_staff_fert` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_kebele_staff_fert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_moa_fert`
--

DROP TABLE IF EXISTS `users_moa_fert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_moa_fert` (
  `umoafid` int NOT NULL AUTO_INCREMENT,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`umoafid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_moa_fert`
--

LOCK TABLES `users_moa_fert` WRITE;
/*!40000 ALTER TABLE `users_moa_fert` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_moa_fert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_partner_fert`
--

DROP TABLE IF EXISTS `users_partner_fert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_partner_fert` (
  `upfid` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`upfid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_partner_fert`
--

LOCK TABLES `users_partner_fert` WRITE;
/*!40000 ALTER TABLE `users_partner_fert` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_partner_fert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_pc_fert`
--

DROP TABLE IF EXISTS `users_pc_fert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_pc_fert` (
  `upcfid` int NOT NULL AUTO_INCREMENT,
  `pc` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`upcfid`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_pc_fert`
--

LOCK TABLES `users_pc_fert` WRITE;
/*!40000 ALTER TABLE `users_pc_fert` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_pc_fert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_region_staff_fert`
--

DROP TABLE IF EXISTS `users_region_staff_fert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_region_staff_fert` (
  `urid` int NOT NULL AUTO_INCREMENT,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`urid`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_region_staff_fert`
--

LOCK TABLES `users_region_staff_fert` WRITE;
/*!40000 ALTER TABLE `users_region_staff_fert` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_region_staff_fert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_registration`
--

DROP TABLE IF EXISTS `users_registration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_registration` (
  `uid` int NOT NULL AUTO_INCREMENT,
  `name` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `username` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `photo` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `mobile` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `email` varchar(70) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `sector` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `lead_executive` int NOT NULL DEFAULT '0',
  `desk` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `your_role` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `company_name` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `responsibility` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `regdate` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval` varchar(2) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_for_investment` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_for_input` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_for_mechanization` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_for_urban_agriculture` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_for_crop` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_for_protection` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_for_horticulture` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_for_cotton` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_for_extension` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_for_change` int NOT NULL,
  `approval_for_sadmin` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval_for_gallery` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approved_by` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approve_date` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `kukunet` varchar(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `seat_no` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `signature` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `email_reminder_to_use` varchar(3) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `last_email_sent` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `last_activity` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=319 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_registration`
--

LOCK TABLES `users_registration` WRITE;
/*!40000 ALTER TABLE `users_registration` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_registration` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_superadmin`
--

DROP TABLE IF EXISTS `users_superadmin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_superadmin` (
  `upcfid` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `adminphone` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `level` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `role` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`upcfid`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_superadmin`
--

LOCK TABLES `users_superadmin` WRITE;
/*!40000 ALTER TABLE `users_superadmin` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_superadmin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_transporter_fert`
--

DROP TABLE IF EXISTS `users_transporter_fert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_transporter_fert` (
  `upfid` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`upfid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_transporter_fert`
--

LOCK TABLES `users_transporter_fert` WRITE;
/*!40000 ALTER TABLE `users_transporter_fert` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_transporter_fert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_union_fert`
--

DROP TABLE IF EXISTS `users_union_fert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_union_fert` (
  `uufid` int NOT NULL AUTO_INCREMENT,
  `union_id` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`uufid`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_union_fert`
--

LOCK TABLES `users_union_fert` WRITE;
/*!40000 ALTER TABLE `users_union_fert` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_union_fert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_woreda_staff_fert`
--

DROP TABLE IF EXISTS `users_woreda_staff_fert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_woreda_staff_fert` (
  `uwfid` int NOT NULL AUTO_INCREMENT,
  `pc` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`uwfid`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_woreda_staff_fert`
--

LOCK TABLES `users_woreda_staff_fert` WRITE;
/*!40000 ALTER TABLE `users_woreda_staff_fert` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_woreda_staff_fert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_zone_staff_fert`
--

DROP TABLE IF EXISTS `users_zone_staff_fert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_zone_staff_fert` (
  `upcfid` int NOT NULL AUTO_INCREMENT,
  `email` varchar(80) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `mobile` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  PRIMARY KEY (`upcfid`)
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_zone_staff_fert`
--

LOCK TABLES `users_zone_staff_fert` WRITE;
/*!40000 ALTER TABLE `users_zone_staff_fert` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_zone_staff_fert` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse_fert_count`
--

DROP TABLE IF EXISTS `warehouse_fert_count`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouse_fert_count` (
  `whfc_id` int NOT NULL,
  `warehouse_name` varchar(200) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `car_plate_no` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `capacity` varchar(5) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `start_number` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `end_number` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `counting_number` int NOT NULL,
  `dateTime` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `recorded_by` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_fert_count`
--

LOCK TABLES `warehouse_fert_count` WRITE;
/*!40000 ALTER TABLE `warehouse_fert_count` DISABLE KEYS */;
/*!40000 ALTER TABLE `warehouse_fert_count` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse_fert_count_active`
--

DROP TABLE IF EXISTS `warehouse_fert_count_active`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouse_fert_count_active` (
  `whfcaid` int NOT NULL,
  `bach_no` int NOT NULL,
  `warehouse` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `barcode_number` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `datetime` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `recby` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_fert_count_active`
--

LOCK TABLES `warehouse_fert_count_active` WRITE;
/*!40000 ALTER TABLE `warehouse_fert_count_active` DISABLE KEYS */;
/*!40000 ALTER TABLE `warehouse_fert_count_active` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse_manual_receive`
--

DROP TABLE IF EXISTS `warehouse_manual_receive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouse_manual_receive` (
  `whmid` int NOT NULL,
  `truck_assign_id` varchar(25) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `warehouse` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `transporter_name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `plate_no` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `driver` varchar(45) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `waybill_number` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `date_arrived` varchar(28) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `fertilizer_type` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `amount_on_the_document` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `received_amount` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `problem_exist` int NOT NULL,
  `note_by_union` text CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reg_by` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval` int NOT NULL,
  `approval_by` varchar(40) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `approval_date` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_manual_receive`
--

LOCK TABLES `warehouse_manual_receive` WRITE;
/*!40000 ALTER TABLE `warehouse_manual_receive` DISABLE KEYS */;
/*!40000 ALTER TABLE `warehouse_manual_receive` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `woreda_fert_demand_summary`
--

DROP TABLE IF EXISTS `woreda_fert_demand_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `woreda_fert_demand_summary` (
  `wfdid` int NOT NULL AUTO_INCREMENT,
  `woreda` int NOT NULL,
  `zone` int NOT NULL,
  `region` int NOT NULL,
  `year_season` varchar(30) NOT NULL,
  `fert_type` varchar(25) NOT NULL,
  `demand_collected` varchar(20) NOT NULL,
  `demand_intellegence` varchar(20) NOT NULL,
  `demand_adjusted_by_kebele` varchar(20) NOT NULL,
  `demand_adjusted_by_woreda` varchar(20) NOT NULL,
  `demand_adjusted_by_zone` varchar(30) NOT NULL,
  `stop_adjustment` int NOT NULL,
  PRIMARY KEY (`wfdid`)
) ENGINE=MyISAM AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `woreda_fert_demand_summary`
--

LOCK TABLES `woreda_fert_demand_summary` WRITE;
/*!40000 ALTER TABLE `woreda_fert_demand_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `woreda_fert_demand_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `woredas`
--

DROP TABLE IF EXISTS `woredas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `woredas` (
  `woreda_id` int NOT NULL AUTO_INCREMENT,
  `woreda_name` varchar(190) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `seat` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region_id` int NOT NULL,
  `zone_id` int NOT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`woreda_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1180 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `woredas`
--

LOCK TABLES `woredas` WRITE;
/*!40000 ALTER TABLE `woredas` DISABLE KEYS */;
/*!40000 ALTER TABLE `woredas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `year`
--

DROP TABLE IF EXISTS `year`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `year` (
  `kebele` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `yid` int NOT NULL AUTO_INCREMENT,
  `year` varchar(8) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `season` varchar(26) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `current` int DEFAULT NULL,
  PRIMARY KEY (`yid`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `year`
--

LOCK TABLES `year` WRITE;
/*!40000 ALTER TABLE `year` DISABLE KEYS */;
/*!40000 ALTER TABLE `year` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `year_moa`
--

DROP TABLE IF EXISTS `year_moa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `year_moa` (
  `yid` int NOT NULL AUTO_INCREMENT,
  `year` varchar(8) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `season` varchar(26) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `current` int DEFAULT NULL,
  PRIMARY KEY (`yid`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `year_moa`
--

LOCK TABLES `year_moa` WRITE;
/*!40000 ALTER TABLE `year_moa` DISABLE KEYS */;
/*!40000 ALTER TABLE `year_moa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `year_region`
--

DROP TABLE IF EXISTS `year_region`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `year_region` (
  `yid` int NOT NULL AUTO_INCREMENT,
  `region` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `year` varchar(8) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `season` varchar(26) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `current` int DEFAULT NULL,
  PRIMARY KEY (`yid`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `year_region`
--

LOCK TABLES `year_region` WRITE;
/*!40000 ALTER TABLE `year_region` DISABLE KEYS */;
/*!40000 ALTER TABLE `year_region` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zone_fert_demand_summary`
--

DROP TABLE IF EXISTS `zone_fert_demand_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zone_fert_demand_summary` (
  `zfdid` int NOT NULL AUTO_INCREMENT,
  `zone` int NOT NULL,
  `region` int NOT NULL,
  `year_season` varchar(30) NOT NULL,
  `fert_type` varchar(25) NOT NULL,
  `demand_collected` varchar(20) NOT NULL,
  `demand_intellegence` varchar(20) NOT NULL,
  `demand_adjusted_by_woreda` varchar(20) NOT NULL,
  `demand_adjusted_by_zone` varchar(30) NOT NULL,
  `demand_adjusted_by_region` varchar(30) NOT NULL,
  `stop_adjustment` int NOT NULL,
  PRIMARY KEY (`zfdid`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zone_fert_demand_summary`
--

LOCK TABLES `zone_fert_demand_summary` WRITE;
/*!40000 ALTER TABLE `zone_fert_demand_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `zone_fert_demand_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zones`
--

DROP TABLE IF EXISTS `zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zones` (
  `zone_id` int NOT NULL AUTO_INCREMENT,
  `zone_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `seat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region_id` int NOT NULL,
  `map` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `recTime` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`zone_id`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zones`
--

LOCK TABLES `zones` WRITE;
/*!40000 ALTER TABLE `zones` DISABLE KEYS */;
/*!40000 ALTER TABLE `zones` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-13 16:29:14
