import { AddressModel } from '../models/addressModel.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/apiResponse.js';

// ─── GET ALL ADDRESSES ────────────────────────────────────────────────
export const getAddresses = catchAsync(async (req, res) => {
  const addresses = await AddressModel.findAllByUser(req.user.id);
  return sendSuccess(res, 200, 'Addresses fetched successfully.', addresses);
});

// ─── GET SINGLE ADDRESS ───────────────────────────────────────────────
export const getAddressById = catchAsync(async (req, res) => {
  const address = await AddressModel.findById(req.params.id);
  if (!address) throw new AppError('Address not found.', 404);
  if (address.userId !== req.user.id) throw new AppError('Access denied.', 403);
  return sendSuccess(res, 200, 'Address fetched successfully.', address);
});

// ─── CREATE ADDRESS ───────────────────────────────────────────────────
export const createAddress = catchAsync(async (req, res) => {
  const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

  const id = await AddressModel.create({
    userId: req.user.id,
    fullName,
    phone,
    addressLine1,
    addressLine2: addressLine2 || null,
    city,
    state,
    postalCode,
    country: country || 'India',
    isDefault: isDefault === true || isDefault === 'true'
  });

  const address = await AddressModel.findById(id);
  return sendSuccess(res, 201, 'Address added successfully.', address);
});

// ─── UPDATE ADDRESS ───────────────────────────────────────────────────
export const updateAddress = catchAsync(async (req, res) => {
  const address = await AddressModel.findById(req.params.id);
  if (!address) throw new AppError('Address not found.', 404);
  if (address.userId !== req.user.id) throw new AppError('Access denied.', 403);

  const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

  await AddressModel.update(req.params.id, {
    fullName: fullName ?? address.fullName,
    phone: phone ?? address.phone,
    addressLine1: addressLine1 ?? address.addressLine1,
    addressLine2: addressLine2 !== undefined ? addressLine2 : address.addressLine2,
    city: city ?? address.city,
    state: state ?? address.state,
    postalCode: postalCode ?? address.postalCode,
    country: country ?? address.country,
    isDefault: isDefault !== undefined ? (isDefault === true || isDefault === 'true') : address.isDefault
  });

  const updated = await AddressModel.findById(req.params.id);
  return sendSuccess(res, 200, 'Address updated successfully.', updated);
});

// ─── SET DEFAULT ADDRESS ──────────────────────────────────────────────
export const setDefaultAddress = catchAsync(async (req, res) => {
  const address = await AddressModel.findById(req.params.id);
  if (!address) throw new AppError('Address not found.', 404);
  if (address.userId !== req.user.id) throw new AppError('Access denied.', 403);

  await AddressModel.setDefault(req.user.id, req.params.id);
  const updated = await AddressModel.findById(req.params.id);
  return sendSuccess(res, 200, 'Default address updated.', updated);
});

// ─── DELETE ADDRESS ───────────────────────────────────────────────────
export const deleteAddress = catchAsync(async (req, res) => {
  const address = await AddressModel.findById(req.params.id);
  if (!address) throw new AppError('Address not found.', 404);
  if (address.userId !== req.user.id) throw new AppError('Access denied.', 403);

  await AddressModel.delete(req.params.id);
  return sendSuccess(res, 200, 'Address deleted successfully.');
});
