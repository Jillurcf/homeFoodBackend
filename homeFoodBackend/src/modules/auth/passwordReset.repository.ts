import PasswordResetOtp from "./passwordReset.model";

export const findActiveResetByEmail = async (email: string) => {
  const now = new Date();
  return PasswordResetOtp.findOne({
    email: email.toLowerCase().trim(),
    consumedAt: null,
    expiresAt: { $gt: now },
  });
};

export const findAnyResetByEmail = async (email: string) => {
  return PasswordResetOtp.findOne({ email: email.toLowerCase().trim() });
};

export const createOrUpdateReset = async (data: {
  email: string;
  codeHash: string;
  expiresAt: Date;
  lastSentAt: Date;
}) => {
  return PasswordResetOtp.findOneAndUpdate(
    { email: data.email.toLowerCase().trim() },
    {
      codeHash: data.codeHash,
      attempts: 0,
      expiresAt: data.expiresAt,
      lastSentAt: data.lastSentAt,
      consumedAt: null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const incrementAttempts = async (email: string) => {
  const now = new Date();
  return PasswordResetOtp.findOneAndUpdate(
    {
      email: email.toLowerCase().trim(),
      consumedAt: null,
      expiresAt: { $gt: now },
    },
    { $inc: { attempts: 1 } },
    { new: true }
  );
};

export const consumeReset = async (email: string) => {
  return PasswordResetOtp.findOneAndUpdate(
    { email: email.toLowerCase().trim(), consumedAt: null },
    { consumedAt: new Date() },
    { new: true }
  );
};

export const deleteResetByEmail = async (email: string) => {
  return PasswordResetOtp.deleteOne({ email: email.toLowerCase().trim() });
};

export const deleteResetByEmailAndCodeHash = async (
  email: string,
  codeHash: string
) => {
  return PasswordResetOtp.deleteOne({
    email: email.toLowerCase().trim(),
    codeHash,
  });
};
