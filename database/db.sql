-- driveclean数据库原始建表语句
-- 用户信息表
CREATE TABLE `dc_users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `wallet_pub` varchar (127) NOT NULL DEFAULT '' COMMENT '钱包public key',
  `wallet_token` varchar (127) NOT NULL DEFAULT '' COMMENT '钱包token',
  `wallet_type` varchar (127) NOT NULL DEFAULT '' COMMENT '钱包类型 phantom',
  `email` varchar (255) NOT NULL DEFAULT '' COMMENT '电子邮件',
  `is_email_verified` tinyint (1) NOT NULL DEFAULT 0 COMMENT '电子邮箱是否已验证 0 否 1 是',
  `uname` varchar (127) NOT NULL DEFAULT '' COMMENT '名字',
  `face` varchar (255) NOT NULL DEFAULT '' COMMENT '头像',
  `sex` tinyint (1) NOT NULL DEFAULT 0 COMMENT '性别 0 secret 1 female 2 male',
  `password` varchar (255) NOT NULL DEFAULT '' COMMENT '密码',
  `salt` varchar (255) NOT NULL DEFAULT '' COMMENT '盐',
  `last_login_time` datetime NOT NULL DEFAULT '0001-01-01 00:00:00' COMMENT '最后登录时间',
  `balance` DECIMAL(65,9) NOT NULL DEFAULT 0 COMMENT 'token余额',
  `power` int UNSIGNED NOT NULL DEFAULT 0 COMMENT 'power属性',
  `tesla_refresh_token` varchar (10000) NOT NULL DEFAULT '' COMMENT '特斯拉refresh_token',
  `vehicle_id` varchar (255) NOT NULL DEFAULT '' COMMENT '车辆id',
  `mtime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `ctime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  key `ix_mtime` USING btree (`mtime`),
  unique key `uk_wallet_pub` USING btree (`wallet_pub`),
  unique key `uk_email` USING btree (`email`)
) ENGINE = innodb DEFAULT CHARACTER SET = "utf8mb4" COLLATE = "utf8mb4_general_ci" COMMENT = '用户表';

-- Car NFT详情表
CREATE TABLE `dc_nft_cars` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `name` varchar (255) NOT NULL DEFAULT '' COMMENT 'NFT名称',
  `mint_address` varchar (127) NOT NULL DEFAULT '' COMMENT 'NFT mint地址',
  `token_account_address` varchar (127) NOT NULL DEFAULT '' COMMENT 'NFT token account 地址',
  `photo_url` varchar (255) NOT NULL DEFAULT '' COMMENT 'NFT图片url(远程)',
  `photo_local_url` varchar (255) NOT NULL DEFAULT '' COMMENT 'NFT图片url(本地)',
  `is_distributed` tinyint (1) NOT NULL DEFAULT 0 COMMENT '是否已分发 0 否 1 是',
  `is_listed` tinyint (1) NOT NULL DEFAULT 0 COMMENT '是否已上架 0 否 1 是',
  `owner_mid` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT 'NFT所有者id',
  `price` DECIMAL(65,9) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'NFT price',
  `royalties` INT UNSIGNED NOT NULL DEFAULT 0 comment'NFT royalties to original creator, 0-100%',
  `level` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'NFT等级',
  `attribute_horsepower` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'NFT属性horsepower',
  `attribute_durability` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'NFT属性durability',
  `attribute_luckiness` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'NFT属性luckiness',
  `type` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'NFT类型 1 Sports, 2 Pickup Truck, 3 Super Car',
  `rarity` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'NFT稀有度 1 Common, 2 Uncommon, 3 Rare, 4 SuperRare',
  `lifespan` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'NFT生命周期',
  `car_mint_times` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'NFT被用于Mint次数，0-10',
  `car_parts_1_type` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Car Parts #1类型，对应关系待定义',
  `car_parts_1_address` varchar (127) NOT NULL DEFAULT '' COMMENT 'Car Parts #1地址',
  `car_parts_1_rarity` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Car Parts #1稀有度 1 Common, 2 Uncommon, 3 Rare, 4 SuperRare',
  `car_parts_2_type` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Car Parts #2类型，对应关系待定义',
  `car_parts_2_address` varchar (127) NOT NULL DEFAULT '' COMMENT 'Car Parts #2地址',
  `car_parts_2_rarity` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Car Parts #2稀有度 1 Common, 2 Uncommon, 3 Rare, 4 SuperRare',
  `car_parts_3_type` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Car Parts #3类型，对应关系待定义',
  `car_parts_3_address` varchar (127) NOT NULL DEFAULT '' COMMENT 'Car Parts #3地址',
  `car_parts_3_rarity` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Car Parts #3稀有度 1 Common, 2 Uncommon, 3 Rare, 4 SuperRare',
  `car_parts_4_type` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Car Parts #4类型，对应关系待定义',
  `car_parts_4_address` varchar (127) NOT NULL DEFAULT '' COMMENT 'Car Parts #4地址',
  `car_parts_4_rarity` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Car Parts #4稀有度 1 Common, 2 Uncommon, 3 Rare, 4 SuperRare',
  `depreciation` TINYINT UNSIGNED NOT NULL DEFAULT 100 COMMENT 'NFT折旧率百分比 0-100整数 100代表无折损',
  `mtime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `ctime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  key `ix_mtime` USING btree (`mtime`),
  unique key `uk_mint_address` USING btree (`mint_address`)
) ENGINE = innodb DEFAULT CHARACTER SET = "utf8mb4" COLLATE = "utf8mb4_general_ci" COMMENT = 'Car NFT详情表';

-- 充电表
CREATE TABLE `dc_charges` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键，充电id',
  `mid` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '发生流水的用户id',
  `vehicle_id` varchar (255) NOT NULL DEFAULT '' COMMENT '进行充电的车辆id',
  `car_nft_id` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '进行充电时使用的NFT车辆id',
  `charge_status` tinyint (1) NOT NULL DEFAULT 0 COMMENT '充电状态 0 进行中 1 已结束',
  `factors` text NOT NULL DEFAULT '' COMMENT '开始充电时刻用于计算earning的所有参数json',
  `total_kwh` DECIMAL(65,2) NOT NULL DEFAULT 0 COMMENT '总共变化的电量',
  `total_amount` DECIMAL(65,9) NOT NULL DEFAULT 0 COMMENT '总共获得的token数量',
  `mtime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `ctime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  key `ix_mid` USING btree (`mid`),
  key `ix_mtime` USING btree (`mtime`)
) ENGINE = innodb DEFAULT CHARACTER SET = "utf8mb4" COLLATE = "utf8mb4_general_ci" COMMENT = '充电表';

-- 充电流水表
CREATE TABLE `dc_charge_logs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `charge_id` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '充电id',
  `kwh` DECIMAL(65,2) NOT NULL DEFAULT 0 COMMENT '变化的电量',
  `amount` DECIMAL(65,9) NOT NULL DEFAULT 0 COMMENT '获得的token数量',
  `count_type` tinyint (1) NOT NULL DEFAULT 0 COMMENT '电量发生类型 0 增加 1 减少',
  `mtime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `ctime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  key `ix_charge_id` USING btree (`charge_id`),
  key `ix_mtime` USING btree (`mtime`)
) ENGINE = innodb DEFAULT CHARACTER SET = "utf8mb4" COLLATE = "utf8mb4_general_ci" COMMENT = '充电流水表';

-- 交易表
CREATE TABLE `dc_transactions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键，交易id',
  `fee_payer_pub` varchar (127) NOT NULL DEFAULT '' COMMENT 'gas支付方的钱包public key',
  `from_pub` varchar (127) NOT NULL DEFAULT '' COMMENT '发送方的钱包public key',
  `to_pub` varchar (127) NOT NULL DEFAULT '' COMMENT '接收方的钱包public key',
  `mint_pub` varchar (127) NOT NULL DEFAULT '' COMMENT 'token的public key',
  `signature` varchar (255) NOT NULL DEFAULT '' COMMENT '调用solana的签名',
  `amount` DECIMAL(65,9) NOT NULL DEFAULT 0 COMMENT 'token数量',
  `source` int NOT NULL DEFAULT 0 COMMENT '调用方',
  `tx_type` int NOT NULL DEFAULT 0 COMMENT '交易类型',
  `tx_status` tinyint NOT NULL DEFAULT 0 COMMENT '交易状态 0 初始化 1 确认中 2 交易成功 3 交易失败',
  `mtime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `ctime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  key `ix_from_pub` USING btree (`from_pub`),
  key `ix_to_pub` USING btree (`to_pub`),
  key `ix_mtime` USING btree (`mtime`)
) ENGINE = innodb DEFAULT CHARACTER SET = "utf8mb4" COLLATE = "utf8mb4_general_ci" COMMENT = '交易表';

-- 余额流水表
CREATE TABLE `dc_balance_logs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `mid` bigint UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户id',
  `amount` DECIMAL(65,9) NOT NULL DEFAULT 0 COMMENT '变动的token数量',
  `count_type` tinyint (1) NOT NULL DEFAULT 0 COMMENT '变动发生类型 0 增加 1 减少',
  `source` int NOT NULL DEFAULT 0 COMMENT '调用方',
  `mtime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `ctime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  key `ix_mid` USING btree (`mid`),
  key `ix_mtime` USING btree (`mtime`)
) ENGINE = innodb DEFAULT CHARACTER SET = "utf8mb4" COLLATE = "utf8mb4_general_ci" COMMENT = '余额流水表';
