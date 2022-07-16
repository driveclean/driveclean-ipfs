import { NextApiResponse } from "next";
import { ApiRequest } from "@model/model";
import logger from "@lib/logger";
import auth from "@lib/api/middlewares/auth";
import verify from "@lib/api/middlewares/verify";
import prisma from "@lib/prisma";
import { dc_nft_cars } from "@prisma/client";
import { carRarityToString, carTypeToString } from "@lib/utils";
import Cors from "cors";

/**
 * NFT uri
 *
 * @returns nft uri
 */

export type ResDataForURI = {
  // TODO: metadata
};

// 用于nft metadata中的attributes列表
const createJSONAttrList = (car: dc_nft_cars) => {
  return [
    { trait_type: "Car Type", value: carTypeToString(car.type).split(" ")[0] },
    { trait_type: "Car Rarity", value: carRarityToString(car.rarity) },
    { trait_type: "Level", value: car.level.toString() },
    { trait_type: "Car-minting Count", value: car.car_mint_times + "/10" },
    { trait_type: "Car Lifespan", value: car.lifespan + " months" },
    { trait_type: "Horsepower", value: car.attribute_horsepower.toString() },
    { trait_type: "Resiliance", value: car.attribute_durability.toString() },
    { trait_type: "Luckiness", value: car.attribute_luckiness.toString() },
    { trait_type: "Depreciation", value: car.depreciation.toString() },
    { trait_type: "Car Parts 1", value: "None/None/None" },
    { trait_type: "Car Parts 2", value: "None/None/None" },
    { trait_type: "Car Parts 3", value: "None/None/None" },
    { trait_type: "Car Parts 4", value: "None/None/None" },
  ];
};

// Initializing the cors middleware
const cors = Cors({
  methods: ["GET", "HEAD"],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

const handler = async (req: ApiRequest<null, null>, resp: NextApiResponse) => {
  try {
    // if (req.method !== "GET") {
    //     resp.status(405).json({
    //       msg: "method not allowed",
    //     });
    //     return;
    //   }

    await runMiddleware(req, resp, cors);

    const { nftId } = req.query as { nftId: string };
    const uri_json = {
      name: "DriveClean_Car_test_0",
      symbol: "DC",
      description: "test NFT for DriveClean. Use it to drive2earn.",
      seller_fee_basis_points: 200,
      image: "https://www.arweave.net/4f33n_7HDAyKp2lfCAK46T5I7s1ZsnnUt4B_zonKVBY?ext=png",
      attributes: [
        { trait_type: "Car Type", value: "Sports" },
        { trait_type: "Car Rarity", value: "Common" },
        { trait_type: "Level", value: "1" },
        { trait_type: "Car-minting Count", value: "0/10" },
        { trait_type: "Car Lifespan", value: "18 months" },
        { trait_type: "Horsepower", value: "100" },
        { trait_type: "Durability", value: "100" },
        { trait_type: "Luckiness", value: "100" },
        { trait_type: "Depreciation", value: "100" },
        { trait_type: "Car Parts 1", value: "None/None/None" },
        { trait_type: "Car Parts 2", value: "None/None/None" },
        { trait_type: "Car Parts 3", value: "None/None/None" },
        { trait_type: "Car Parts 4", value: "None/None/None" },
      ],
      properties: {
        files: [
          { uri: "https://www.arweave.net/4f33n_7HDAyKp2lfCAK46T5I7s1ZsnnUt4B_zonKVBY?ext=png", type: "image/png" },
        ],
        creators: [{ address: "6v1KGt2Pi3hXLkd1zRngwQQdG6fVFmbXf72yM6kgCaRH", share: 100 }],
      },
    };
    const car_nft = await prisma.dc_nft_cars.findUnique({
      where: { id: BigInt(nftId) },
    });

    uri_json.name = car_nft.name;
    uri_json.image = car_nft.photo_url;
    uri_json.attributes = createJSONAttrList(car_nft);

    resp.status(200).json(uri_json);
  } catch (e) {
    logger.logErrorReq(req, e);
    console.log(e);

    if (resp.statusCode === 200) {
      resp.statusCode = 500;
    }
    resp.json({ msg: "unexpected error" });
    return;
  }
};

export default handler;
