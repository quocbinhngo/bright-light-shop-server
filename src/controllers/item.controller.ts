import { Request, Response } from "express";
import { find } from "lodash";

import { ItemDocument } from "../models/item.model";
import { createItem, findItem, findItems, getImageUrl, getItemIdentifier, getItemResponse, getMaxItemCode, updateItem } from "../services/item.service";
import { AddItemQuantityPayload, CreateItemPayload, GetItemByIdPayload, UpdateItemPayload } from "../validations/item.validation";

export async function createItemHandler(
  req: Request<{}, {}, CreateItemPayload["body"]>,
  res: Response
) {
  const {
    publishedYear,
    title,
    rentalType,
    copiesNumber,
    rentalFee,
    genre,
    imageUrl,
  } = req.body;

  if (!genre && (rentalType === "dvd" || rentalType === "record")) {
    return res.status(400).json("Dvd or record must have genre");
  }

  if (genre && rentalType === "game") {
    return res.status(400).json("Game does not have genre");
  }

  if (await findItem({ title, publishedYear })) {
    return res.status(400).json("Title and published year is already exists");
  }

  const itemCode = ((await getMaxItemCode(publishedYear)) || 0) + 1;
  const image = await getImageUrl(rentalType);

  console.log("OK");

  const item = await createItem({
    itemCode,
    publishedYear,
    title,
    rentalType,
    copiesNumber,
    rentalFee,
    genre,
    imageUrl: imageUrl ? imageUrl : image.url,
  });

  const itemResponse = await getItemResponse(item);

  return res.status(201).json(itemResponse);
}

export async function getItemsHandler(req: Request, res: Response) {
  const { rentalType, status, desc } = req.query;
  const sortBy = req.query.sortBy as string;
  const sort = { [sortBy]: desc ? -1 : 1 };

  let items;
  if (rentalType) {
    items = await findItems({ rentalType }, { sort });
  } else {
    items = await findItems({}, { sort });
  }

  const itemsResponse = await Promise.all(
    items.map(async (item) => getItemResponse(item))
  );

  if (!status) {
    return res.status(200).json(itemsResponse);
  }

  if (status === "non-available") {
    const nonAvailableItemsResponse = itemsResponse.filter(
      (item) => item.availableNumber === 0
    );
    return res.status(200).json(nonAvailableItemsResponse);
  }

  const availableItemsResponse = itemsResponse.filter(
    (item) => item.availableNumber > 0
  );
  return res.status(200).json(availableItemsResponse);
}

export async function searchItemsHandler(req: Request, res: Response) {
  const search = req.query.search as string;
  const allItems = await findItems({});

  if (search === "") {
    const itemsResponse = await Promise.all(
      allItems.map(async (item) => getItemResponse(item))
    );
    return res.status(200).json(itemsResponse);
  }

  const items = allItems.filter(
    (item) =>
      item.title.toLowerCase() === search.toLowerCase() ||
      getItemIdentifier(item) === search
  );

  const itemsResponse = await Promise.all(
    items.map(async (item) => getItemResponse(item))
  );

  return res.status(200).json(itemsResponse);
}

export async function getItemByIdHandler(
  req: Request<GetItemByIdPayload["params"], {}, {}, {}>,
  res: Response
) {
  try {
    const { itemId } = req.params;

    const item = await findItem({ _id: itemId });

    if (!item) {
      return res.status(404).send("Item does not exists");
    }

    const itemResponse = await getItemResponse(item);

    return res.status(200).send(itemResponse);
  } catch (error: any) {
    return res.status(500).send("Cannot get item by id");
  }
}

export async function updateItemHandler(
  req: Request<UpdateItemPayload["params"], {}, UpdateItemPayload["body"]>,
  res: Response
) {
  const { itemId } = req.params;
  const { publishedYear, title, rentalType, copiesNumber, rentalFee, genre } =
    req.body;

  if ((!genre && rentalType === "dvd") || rentalType === "record") {
    return res.status(400).json("Dvd or record must have genre");
  }

  if (genre && rentalType === "game") {
    return res.status(400).json("Game does not have genre");
  }

  if (await findItem({ title, publishedYear })) {
    return res.status(400).json("Title and published year is already exists");
  }

  if (!(await findItem({ _id: itemId }))) {
    return res.status(400).json("Item is not existed");
  }

  const item = await updateItem(
    { _id: itemId },
    { publishedYear, title, rentalType, copiesNumber, rentalFee }
  );

  const itemResponse = await getItemResponse(item as ItemDocument);

  return res.status(200).json(itemResponse);
}

export async function addItemQuantityHandler(
  req: Request<
    AddItemQuantityPayload["params"],
    {},
    AddItemQuantityPayload["body"]
  >,
  res: Response
) {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const item = await findItem({ _id: itemId });

  if (!item) {
    return res.status(400).json("Cannot find item");
  }

  const updatedItem = await updateItem(
    { _id: itemId },
    { copiesNumber: item.copiesNumber + quantity }
  );

  const itemResponse = await getItemResponse(updatedItem as ItemDocument);

  return res.status(200).json(itemResponse);
}
