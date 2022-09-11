import { omit } from "lodash";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";

import ItemImageModel from "../models/item-image.model";
import ItemModel, { ItemDocument } from "../models/item.model";
import { ItemInput } from "../models/item.model";
import { getItemAvailableNumber } from "./order.service";

export async function createItem(input: ItemInput) {
  const item = new ItemModel(input);
  await item.save();
  return item;
}

export async function findItem(
  query: FilterQuery<ItemDocument>,
  options: QueryOptions = {}
) {
  return await ItemModel.findOne(query, options);
}

export async function findItems(
  query: FilterQuery<ItemDocument>,
  options: QueryOptions = {}
) {
  return await ItemModel.find(query, null, options);
}

export async function updateItem(
  query: FilterQuery<ItemDocument>,
  update: UpdateQuery<ItemDocument>,
  options: QueryOptions = { new: true }
) {
  return await ItemModel.findOneAndUpdate(query, update, options);
}

export function getItemIdentifier(item: ItemDocument) {
  return (
    "I" +
    item.itemCode.toString().padStart(3, "0") +
    "-" +
    item.publishedYear.toString()
  );
}

export async function getMaxItemCode(publishedYear: number) {
  const items = await ItemModel.find({ publishedYear })
    .sort({ itemCode: -1 })
    .limit(1);

  if (!items || !items[0]) {
    return 0;
  }

  return +items[0].itemCode;
}

export async function getImageUrl(rentalType: string) {
  const imageUrls = await ItemImageModel.find({ rentalType });
  return imageUrls[Math.floor(Math.random() * imageUrls.length)];
}

export async function getItemResponse(item: ItemDocument) {
  const item1 = omit(item.toJSON(), ["createdAt", "updatedAt", "__v"]);
  const availableNumber = await getItemAvailableNumber(item1._id);
  const identifier = getItemIdentifier(item);
  return { ...item1, availableNumber, identifier };
}
