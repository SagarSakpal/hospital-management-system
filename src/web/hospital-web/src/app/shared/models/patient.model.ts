export interface Patient {
  id: number;
  userId: string;
  name: string;
  dob: string;     // ISO string
  gender: string;
  contact: string;
  condition: string;
}