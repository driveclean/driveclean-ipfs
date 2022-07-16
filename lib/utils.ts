import { IItem } from "@model/model";
import { dc_nft_cars } from "@prisma/client";
import base58 from "bs58";
import { createHash } from "crypto";
import nacl from "tweetnacl";

// 获取一个区间范围内的随机整数
export const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 获取一个区间范围内的随机浮点数，保留小数点后特定位
export const getRandomFloat = (min: number, max: number, decimals: number = 2) => {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
};

/**
 * 获取一个指定长度的随机字符串，以base58编码
 * @param length 随机字符串长度
 * @returns base58编码的随机字符串
 */
export const getRandomString = (length: number) => {
  return base58.encode(nacl.randomBytes(length));
};

/**
 * @deprecated 看起来并不好用
 * 创建一个轮询方法，直到传入的方法返回true为止
 * @param f 一个返回boolean的Promise，返回false则继续执行，否则结束
 * @returns
 */
export async function waitUntil(f: () => Promise<boolean>): Promise<void> {
  return await new Promise((resolve) => {
    const interval = setInterval(async () => {
      const res = await f();
      console.log(res);
      if (res) {
        resolve();
        clearInterval(interval);
      }
    }, 1000);
  });
}

/**
 * Car type数字转化成文字定义(和数据库定义相同)
 * @param t Car type
 * @returns Car type对应的文字定义
 */
export const carTypeToString = (t: number) => {
  switch (t) {
    case 1:
      return "Sports Car";
    case 2:
      return "Pickup Truck";
    case 3:
      return "Super Car";
    default:
      return "";
  }
};

/**
 * Car rarity数字转化成文字定义(和数据库定义相同)
 * @param r Car rarity
 * @returns Car rarity对应的文字定义
 */
export const carRarityToString = (r: number) => {
  switch (r) {
    case 1:
      return "Common";
    case 2:
      return "Uncommon";
    case 3:
      return "Rare";
    case 4:
      return "Super Rare";
    default:
      return "";
  }
};

//
/**
 * 数据库nft car字段转换为Item
 * @param nft_car 数据库返回的一行nft car数据
 * @returns 对应的Item格式数据
 */
export const dcNFTCarToItem = (nft_car: dc_nft_cars) => {
  const x = {} as IItem;
  // PNG to SVG (temporary solution)
  x.pic = ("/" + nft_car.photo_local_url).replace(".png", ".svg");
  x.nid = nft_car.id.toString();
  x.type = carTypeToString(nft_car.type);
  x.mint = nft_car.car_mint_times;
  x.level = nft_car.level;
  x.price = nft_car.price.toString();
  x.rarity = carRarityToString(nft_car.rarity);
  x.lifespan = nft_car.lifespan;
  x.attribute_horsepower = nft_car.attribute_horsepower;
  x.attribute_durability = nft_car.attribute_durability;
  x.attribute_luckiness = nft_car.attribute_luckiness;
  x.depreciation = nft_car.depreciation;
  x.mint_address = nft_car.mint_address;
  x.royalties = nft_car.royalties;
  return x;
};
