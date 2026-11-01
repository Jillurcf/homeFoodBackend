export type RegisterRole = "buyer" | "seller";

export type SignupFormValues = {
  name: string;
  username: string;
  email: string;
  password: string;
  mobile: string;
  nidNumber: string;
  address: string;
};

export type FieldErrors = Partial<Record<keyof SignupFormValues, string>>;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const MOBILE_REGEX = /^\d{6,15}$/;
export const NID_REGEX = /^\d{10,17}$/;
export const TERMS_VERSION = "1.0";

export function validateSignupFields(values: SignupFormValues): FieldErrors {
  const next: FieldErrors = {};

  if (!values.name.trim()) {
    next.name = "Please enter your full name.";
  }

  if (!values.username.trim()) {
    next.username = "Please enter a username.";
  } else if (!USERNAME_REGEX.test(values.username.trim())) {
    next.username = "Username can only contain letters, numbers and underscores.";
  }

  if (!values.email.trim()) {
    next.email = "Please enter your email.";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    next.email = "Please enter a valid email address.";
  }

  if (values.password.length < 6) {
    next.password = "Password must be at least 6 characters long.";
  }

  if (!MOBILE_REGEX.test(values.mobile.trim())) {
    next.mobile = "Please enter a valid mobile number.";
  }

  if (!NID_REGEX.test(values.nidNumber.trim())) {
    next.nidNumber = "Please enter a valid NID number (10 to 17 digits).";
  }

  if (!values.address.trim()) {
    next.address = "Please enter your present address.";
  }

  return next;
}

export function buildSignupPayload(
  values: SignupFormValues,
  role: RegisterRole,
  acceptedTerms = true,
) {
  return {
    name: values.name.trim(),
    username: values.username.trim(),
    email: values.email.trim(),
    password: values.password,
    phone: values.mobile.trim() || undefined,
    nidNumber: values.nidNumber.trim(),
    address: values.address.trim(),
    role,
    acceptedTerms,
    termsVersion: TERMS_VERSION,
  };
}

export function getTermsRoute(role: RegisterRole) {
  return role === "seller"
    ? "/(stack)/marketing/terms/seller"
    : "/(stack)/marketing/terms/buyer";
}
