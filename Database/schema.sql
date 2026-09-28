create database ecomdb;
use ecomdb;

create table admindata(adminid binary(16) primary key,
admin_name varchar(50) not null,
admin_email varchar(50) unique key not null,
admin_address text not null,
admin_password varbinary(255) not null,
admin_agree enum('on','off'),
admin_image varchar(20),
otp char(6),
otp_expiry_time datetime,
account_status enum('active','inactive','suspended'));

create table userdata(userid binary(16) primary key,
username varchar(50) not null,
useremail varchar(50) unique key not null,
useraddress text not null,
userpassword varbinary(255) not null,
userphone varchar(12) unique not null,
usergender enum('female','male','others'),
useragree enum('on','off'),
otp char(6),
otp_expiry_time datetime,
account_status enum('active','inactive','suspended'));

create table items(itemid binary(16) primary key,
item_name longtext not null,
item_descrption longtext,
item_about longtext,
item_price decimal(20,4) not null,
item_stock bigint not null default 1,
item_category enum('home_appliences','toys','electronics','sports','fashion','grocery'),
item_image varchar(20) unique key not null,
adminid binary(16) not null,
foreign key(adminid) references admindata(adminid) on update cascade on delete cascade
);

create table cart(cartid binary(16) primary key,
itemid binary(16) not null,
userid binary(16) not null,
quantity int default 1,
foreign key (itemid) references items(itemid) ,
foreign key (userid) references userdata(userid)
);

create table orders(orderid int unsigned primary key auto_increment,
razorpay_ordid varchar(255),
razorpay_payment varchar(255),
userid binary(16),
total_amount decimal(10,4),
delivery int default 40,
tax decimal(10,2),
grand_total decimal(20,4),
foreign key(userid) references userdata(userid) on update cascade on delete cascade,
status enum('paid','unpaid') default 'paid'
);

create table order_details(
order_detailsid int unsigned primary key auto_increment,
orderid int unsigned,
itemid binary(16),
item_name longtext,
item_price decimal(10,2),
item_quantity int unsigned,
sub_total decimal(10,2),
item_category enum('home_appliences','toys','electronics','sports','fashion','grocery'),
item_image varchar(20),
foreign key(itemid) references items(itemid) on update cascade on delete cascade,
foreign key(orderid) references orders(orderid) on update cascade on delete cascade
);

desc admindata;
desc userdata;
desc items;
desc cart;
desc orders;
desc order_details;


select * from items;
select * from admindata;
select * from userdata;
select * from cart;
select * from orders;
select * from order_details;
