export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  consent: "Marketing opted in" | "Marketing not yet confirmed";
  tags: string[];
  lastOrder: string;
};

