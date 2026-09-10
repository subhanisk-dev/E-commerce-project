create database ecomdb;

use ecomdb;

create table admindata(adminid binary(16) primary key,
admin_name varchar(50) not null,
admin_email varchar(50) unique key not null,
admin_address text not null,
admin_password varbinary(255) not null,
admin_agree enum('on','off'),
admin_image varchar(20));

create table userdata(userid binary(16) primary key,
username varchar(50) not null,
useremail varchar(50) unique key not null,
useraddress text not null,
userpassword varbinary(255) not null,
userphone varchar(12) unique not null,
usergender enum('female','male','others'));

desc admindata;

desc userdata;