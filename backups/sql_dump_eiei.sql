-- MySQL dump 10.13  Distrib 5.7.44, for Linux (x86_64)
--
-- Host: db    Database: fortoon_db
-- ------------------------------------------------------
-- Server version	5.7.44

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
-- Table structure for table `Chapter`
--

DROP TABLE IF EXISTS `Chapter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Chapter` (
  `name` varchar(100) NOT NULL,
  `cId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `storyId` int(10) unsigned NOT NULL,
  `chapterSequence` int(10) unsigned NOT NULL,
  `price` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`cId`),
  KEY `Chapter_Story_FK` (`storyId`),
  CONSTRAINT `Chapter_Story_FK` FOREIGN KEY (`storyId`) REFERENCES `Story` (`sId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Chapter`
--

LOCK TABLES `Chapter` WRITE;
/*!40000 ALTER TABLE `Chapter` DISABLE KEYS */;
INSERT INTO `Chapter` VALUES ('อินโทรดักฉัน',13,1,1,10),('ราตรีแสนสุข',15,23,1,0),('i\'am solo',16,1,2,0),('Gods Vs Mankind\'s Final Struggle',23,26,1,0),('i\'am solo',24,1,5,0),('The Strongest of the Human Race',25,26,2,0);
/*!40000 ALTER TABLE `Chapter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ChapterImage`
--

DROP TABLE IF EXISTS `ChapterImage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ChapterImage` (
  `ciId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `imageSequenceNumber` int(10) unsigned DEFAULT NULL,
  `url` varchar(200) NOT NULL,
  `chapterId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`ciId`),
  KEY `ChapterImage_Chapter_FK` (`chapterId`),
  KEY `ChapterImage_ChapterImage_FK` (`imageSequenceNumber`),
  CONSTRAINT `ChapterImage_Chapter_FK` FOREIGN KEY (`chapterId`) REFERENCES `Chapter` (`cId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChapterImage`
--

LOCK TABLES `ChapterImage` WRITE;
/*!40000 ALTER TABLE `ChapterImage` DISABLE KEYS */;
INSERT INTO `ChapterImage` VALUES (1,1,'userbg-2024-10-14T12:26:38.147Z-image.png',13),(2,2,'userbg-2024-10-14T12:26:38.147Z-image.png',13),(3,3,'userbg-2024-10-14T12:26:38.147Z-image.png',13),(4,4,'userbg-2024-10-14T12:26:38.147Z-image.png',13),(22,1,'chapter-img-Mon Oct 14 2024 17:24:09 GMT+0000 (Coordinated Universal Time)-0.jpg',23),(23,2,'chapter-img-Mon Oct 14 2024 17:24:09 GMT+0000 (Coordinated Universal Time)-1.jpg',23),(24,3,'chapter-img-Mon Oct 14 2024 17:24:09 GMT+0000 (Coordinated Universal Time)-2.jpg',23),(25,4,'chapter-img-Mon Oct 14 2024 17:24:09 GMT+0000 (Coordinated Universal Time)-3.jpg',23),(26,5,'chapter-img-Mon Oct 14 2024 17:24:09 GMT+0000 (Coordinated Universal Time)-4.jpg',23),(27,1,'chapter-img-Tue Oct 15 2024 09:24:29 GMT+0000 (Coordinated Universal Time)-1.webp',25),(28,2,'chapter-img-Tue Oct 15 2024 09:24:29 GMT+0000 (Coordinated Universal Time)-2.webp',25),(29,3,'chapter-img-Tue Oct 15 2024 09:24:29 GMT+0000 (Coordinated Universal Time)-3.webp',25),(30,4,'chapter-img-Tue Oct 15 2024 09:24:29 GMT+0000 (Coordinated Universal Time)-4.webp',25),(31,5,'chapter-img-Tue Oct 15 2024 09:24:29 GMT+0000 (Coordinated Universal Time)-5.webp',25),(32,6,'chapter-img-Tue Oct 15 2024 09:24:29 GMT+0000 (Coordinated Universal Time)-6.webp',25),(33,7,'chapter-img-Tue Oct 15 2024 09:24:29 GMT+0000 (Coordinated Universal Time)-7.webp',25),(34,8,'chapter-img-Tue Oct 15 2024 09:24:29 GMT+0000 (Coordinated Universal Time)-8.webp',25),(35,9,'chapter-img-Tue Oct 15 2024 09:24:29 GMT+0000 (Coordinated Universal Time)-9.webp',25);
/*!40000 ALTER TABLE `ChapterImage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Followership`
--

DROP TABLE IF EXISTS `Followership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Followership` (
  `fId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userId` int(10) unsigned NOT NULL,
  `followerId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`fId`),
  KEY `Relationship_User_FK` (`userId`),
  KEY `Relationship_User_FK_1` (`followerId`),
  CONSTRAINT `Relationship_User_FK` FOREIGN KEY (`userId`) REFERENCES `User` (`uId`),
  CONSTRAINT `Relationship_User_FK_1` FOREIGN KEY (`followerId`) REFERENCES `User` (`uId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Followership`
--

LOCK TABLES `Followership` WRITE;
/*!40000 ALTER TABLE `Followership` DISABLE KEYS */;
/*!40000 ALTER TABLE `Followership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Genre`
--

DROP TABLE IF EXISTS `Genre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Genre` (
  `gId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `genreName` varchar(100) NOT NULL,
  PRIMARY KEY (`gId`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Genre`
--

LOCK TABLES `Genre` WRITE;
/*!40000 ALTER TABLE `Genre` DISABLE KEYS */;
INSERT INTO `Genre` VALUES (1,'Comedy'),(2,'Adventure'),(3,'Fantasy'),(4,'Action'),(5,'Sci-Fi '),(6,'Superhero'),(7,'Detective'),(8,'Horror'),(9,'Shonen'),(10,'Shojo'),(11,'Seinen'),(12,'Josei'),(13,'Isekai'),(14,'Romance'),(15,'Sports'),(16,'Harem'),(17,'Psychological');
/*!40000 ALTER TABLE `Genre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Post`
--

DROP TABLE IF EXISTS `Post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Post` (
  `title` varchar(50) NOT NULL,
  `pId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `content` varchar(400) NOT NULL,
  `parentPostId` int(10) unsigned DEFAULT NULL,
  `posterId` int(10) unsigned NOT NULL,
  `postedDatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pId`),
  KEY `Post_Post_FK` (`parentPostId`),
  KEY `Post_User_FK` (`posterId`),
  CONSTRAINT `Post_Post_FK` FOREIGN KEY (`parentPostId`) REFERENCES `Post` (`pId`),
  CONSTRAINT `Post_User_FK` FOREIGN KEY (`posterId`) REFERENCES `User` (`uId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Post`
--

LOCK TABLES `Post` WRITE;
/*!40000 ALTER TABLE `Post` DISABLE KEYS */;
/*!40000 ALTER TABLE `Post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PostImage`
--

DROP TABLE IF EXISTS `PostImage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PostImage` (
  `piId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parentPostImageId` int(10) unsigned DEFAULT NULL,
  `url` varchar(200) NOT NULL,
  `postId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`piId`),
  KEY `ChapterImage_ChapterImage_FK` (`parentPostImageId`) USING BTREE,
  KEY `ChapterImage_Chapter_FK` (`postId`) USING BTREE,
  CONSTRAINT `PostImage_PostImage_FK` FOREIGN KEY (`parentPostImageId`) REFERENCES `PostImage` (`piId`),
  CONSTRAINT `PostImage_Post_FK` FOREIGN KEY (`postId`) REFERENCES `Post` (`pId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PostImage`
--

LOCK TABLES `PostImage` WRITE;
/*!40000 ALTER TABLE `PostImage` DISABLE KEYS */;
/*!40000 ALTER TABLE `PostImage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Rank`
--

DROP TABLE IF EXISTS `Rank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Rank` (
  `name` varchar(100) NOT NULL,
  `rId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`rId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rank`
--

LOCK TABLES `Rank` WRITE;
/*!40000 ALTER TABLE `Rank` DISABLE KEYS */;
INSERT INTO `Rank` VALUES ('casual',1),('exclusive',2),('vip',3);
/*!40000 ALTER TABLE `Rank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ReviewPost`
--

DROP TABLE IF EXISTS `ReviewPost`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ReviewPost` (
  `rpId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `rating` int(1) NOT NULL,
  `review` varchar(500) NOT NULL,
  `reviewerId` int(10) unsigned NOT NULL,
  `postId` int(10) unsigned NOT NULL,
  `reviewDatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rpId`),
  KEY `reviewerId` (`reviewerId`),
  KEY `postId` (`postId`),
  CONSTRAINT `ReviewPost_ibfk_1` FOREIGN KEY (`reviewerId`) REFERENCES `User` (`uId`) ON DELETE CASCADE,
  CONSTRAINT `ReviewPost_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `Post` (`pId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ReviewPost`
--

LOCK TABLES `ReviewPost` WRITE;
/*!40000 ALTER TABLE `ReviewPost` DISABLE KEYS */;
/*!40000 ALTER TABLE `ReviewPost` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ReviewStory`
--

DROP TABLE IF EXISTS `ReviewStory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ReviewStory` (
  `rsId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `rating` int(1) NOT NULL,
  `review` varchar(500) NOT NULL,
  `reviewerId` int(10) unsigned NOT NULL,
  `storyId` int(10) unsigned NOT NULL,
  `reviewDatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rsId`),
  KEY `reviewerId` (`reviewerId`),
  KEY `storyId` (`storyId`),
  CONSTRAINT `ReviewStory_ibfk_1` FOREIGN KEY (`reviewerId`) REFERENCES `User` (`uId`) ON DELETE CASCADE,
  CONSTRAINT `ReviewStory_ibfk_2` FOREIGN KEY (`storyId`) REFERENCES `Story` (`sId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ReviewStory`
--

LOCK TABLES `ReviewStory` WRITE;
/*!40000 ALTER TABLE `ReviewStory` DISABLE KEYS */;
/*!40000 ALTER TABLE `ReviewStory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Story`
--

DROP TABLE IF EXISTS `Story`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Story` (
  `sId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `introduction` varchar(500) NOT NULL,
  `postedDatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `authorId` int(10) unsigned NOT NULL,
  `coverImageUrl` varchar(200) NOT NULL,
  PRIMARY KEY (`sId`),
  UNIQUE KEY `title` (`title`),
  KEY `Story_User_FK` (`authorId`),
  CONSTRAINT `Story_User_FK` FOREIGN KEY (`authorId`) REFERENCES `User` (`uId`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Story`
--

LOCK TABLES `Story` WRITE;
/*!40000 ALTER TABLE `Story` DISABLE KEYS */;
INSERT INTO `Story` VALUES (1,'Solo Leveling Ragnarok','[จากสตูดิโอ Redice ผู้สร้าง !] การดำรงอยู่ของโลกกำลังตกอยู่ในอันตรายอีกครั้ง เมื่ออิทาริมเทพเจ้าจากจักรวาลอื่น พยายามจะเติมเต็มความว่างเปล่าที่สิ่งมีชีวิตสมบูรณ์ทิ้งไว้ ซองจินอูไม่มีทางเลือกอื่นนอกจากต้องส่งเบรู ราชามดเงา ไปปลุกพลังของลูกชายของเขาและเริ่มต้นการเดินทางที่เขาเคยย่ำมาก่อน ซูโฮต้องพิชิตดันเจี้ยนเงาและพิสูจน์ตัวเองในโลกแห่งฮันเตอร์ในขณะที่เขาเดินทางผ่านโลกใหม่เพื่อต่อสู้กับปีศาจร้ายตัวใหม่ที่ต้องการกลืนกินโลกทั้งใบ','2024-09-26 15:19:00',1,'rj6vt7hdrcdd83kappog'),(23,'demon slayer','Learning to destroy demons won’t be easy, and Tanjiro barely knows where to start. The surprise appearance of another boy named Giyu, who seems to know what’s going on, might provide some answers?but only if Tanjiro can stop Giyu from killing his sister first!','2024-10-12 10:29:55',2,'dragon.jpg'),(26,'record of ragnarock','กพันปีเทพเจ้าจะมาประชุมลงมติอารยธรรมของมนุษยชาติจะดำรงอยู่ต่อหรือไม่ เหล่าเจ้าเทพเจ้าลงมติเป็นเสียงเดียวกันถึงเวลาที่อารยธรรมของมนุษย์ต้องจบเพียงเท่านี้ แต่วัลคีรีสาว Brunhild ไม่เห็นด้วย จึงเกิดเป็นศึกที่ไม่เคยเกิดขึ้นมาก่อน ตัวแทนจากประวัติศาสตร์มนุษยชาติจะต้องลงสังเวียนประลองยุทธกับเทพในการต่อสู้ตัวต่อตัวใน 13 ศึกเพื่อตัดสินชะตาของมวลมนุษยชาติ','2024-10-14 16:54:02',2,'cover.jpg');
/*!40000 ALTER TABLE `Story` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `StoryChapterPermission`
--

DROP TABLE IF EXISTS `StoryChapterPermission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `StoryChapterPermission` (
  `scpId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `chapterId` int(10) unsigned NOT NULL,
  `userId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`scpId`),
  KEY `StoryChapterPermission_Chapter_FK` (`chapterId`),
  KEY `StoryChapterPermission_User_FK` (`userId`),
  CONSTRAINT `StoryChapterPermission_Chapter_FK` FOREIGN KEY (`chapterId`) REFERENCES `Chapter` (`cId`),
  CONSTRAINT `StoryChapterPermission_User_FK` FOREIGN KEY (`userId`) REFERENCES `User` (`uId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `StoryChapterPermission`
--

LOCK TABLES `StoryChapterPermission` WRITE;
/*!40000 ALTER TABLE `StoryChapterPermission` DISABLE KEYS */;
INSERT INTO `StoryChapterPermission` VALUES (3,13,2);
/*!40000 ALTER TABLE `StoryChapterPermission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `StoryGenre`
--

DROP TABLE IF EXISTS `StoryGenre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `StoryGenre` (
  `sgId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `storyId` int(10) unsigned NOT NULL,
  `genreId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`sgId`),
  KEY `StoryGenre_Genre_FK` (`genreId`),
  KEY `StoryGenre_Story_FK` (`storyId`),
  CONSTRAINT `StoryGenre_Genre_FK` FOREIGN KEY (`genreId`) REFERENCES `Genre` (`gId`),
  CONSTRAINT `StoryGenre_Story_FK` FOREIGN KEY (`storyId`) REFERENCES `Story` (`sId`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `StoryGenre`
--

LOCK TABLES `StoryGenre` WRITE;
/*!40000 ALTER TABLE `StoryGenre` DISABLE KEYS */;
INSERT INTO `StoryGenre` VALUES (6,26,1),(7,26,2),(8,26,3);
/*!40000 ALTER TABLE `StoryGenre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `uId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `age` int(10) unsigned NOT NULL,
  `sex` enum('m','f') NOT NULL DEFAULT 'm',
  `credit` int(10) unsigned NOT NULL DEFAULT '0',
  `rankId` int(10) unsigned NOT NULL DEFAULT '1',
  `password` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `registeredDatetime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `displayName` varchar(100) NOT NULL,
  `profilePicUrl` varchar(300) DEFAULT NULL,
  `bgUrl` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`uId`),
  UNIQUE KEY `username` (`username`),
  KEY `User_Rank_FK` (`rankId`),
  CONSTRAINT `User_Rank_FK` FOREIGN KEY (`rankId`) REFERENCES `Rank` (`rId`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (1,22,'m',10,1,'kayn','kayn','mailser','2024-09-20 15:12:45','kayn','user-2024-10-14T10:55:10.410Z-image.png','userbg-2024-10-14T12:26:38.147Z-image.png'),(2,22,'m',20,1,'yone','yone','mailser','2024-09-20 15:12:45','yoNeeeeeee','profilePic-yone-image.png','background-yone-6.jpg'),(7,8,'f',0,1,'teemoteemo','teemo','teemo@km.ac.th','2024-10-14 10:01:43','teemo','user-Mon Oct 14 2024 10:01:42 GMT+0000 (Coordinated Universal Time)-image.png',NULL),(10,8,'m',0,1,'rakan88888','rakan','rakan@lover.th','2024-10-15 13:07:25','rakan','user-Tue Oct 15 2024 13:07:23 GMT+0000 (Coordinated Universal Time)-02.jpg',NULL);
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-15 18:16:07
