-- Script to create database with some tables

-- upgrade root account (only once!)
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
-- flush privileges;

-- 1. Drop whole database if exists
drop database if exists PakoTest;

-- 2. Create database if not exists
create database PakoTest;

-- table Users
create table PakoTest.Users (
	UserId int auto_increment,
    UserName nvarchar(50) not null,
    UserPassword varchar(100) not null,
    UserEmail nvarchar(50) not null,
    LastLoginTime datetime, 
    RegistrationTime datetime,
    UserStatus int default 1,
    primary key(UserId)
);

insert into PakoTest.Users(UserName, UserPassword, UserEmail, LastLoginTime, RegistrationTime) values('Edek',	'Bezkredek',	'edek@gmail.com',	null,	'2022-11-03 13:42:21');
insert into PakoTest.Users(UserName, UserPassword, UserEmail, LastLoginTime, RegistrationTime) values('Witek',	'Prytek',		'witek@gmail.com',	null,	'2022-11-03 13:42:21');
insert into PakoTest.Users(UserName, UserPassword, UserEmail, LastLoginTime, RegistrationTime) values('Ala',	'Makota',		'edek@gmail.com',	null,	'2022-11-03 13:42:21');

select * from PakoTest.Users;

-- create table emails


-- end of script