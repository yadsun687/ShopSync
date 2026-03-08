import { z } from 'zod';

export const step1Schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

export const step2Schema = z
  .object({
    occupation: z.enum(['Developer', 'Designer', 'Manager'], {
      errorMap: () => ({ message: 'Please select an occupation' }),
    }),
    company: z.string().min(1, 'Company is required'),
    githubUrl: z.string().optional().default(''),
  })
  .refine(
    (data) => {
      if (data.occupation === 'Developer') {
        try {
          new URL(data.githubUrl);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Valid GitHub URL is required for Developers',
      path: ['githubUrl'],
    }
  );
