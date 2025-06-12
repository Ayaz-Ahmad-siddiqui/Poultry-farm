import {
  Dialog,
  DialogPortal,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // or use your own input component
import React from 'react';

const ForgetPassword = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className='text-sm text-green-600 font-semibold cursor-pointer'>Forget Password!</p>
      </DialogTrigger>
        <DialogPortal>
            <DialogOverlay className='fixed inset-0 bg-black/50 z-50'>
      <DialogContent className="max-w-md p-6 bg-white rounded-lg shadow-lg fixed top-1/2 -translate-y-1/2  left-1/2  -translate-x-1/2 z-50 ">
        <DialogTitle className="text-lg font-bold">Forget Password</DialogTitle>
        <DialogDescription className="text-sm text-gray-500 mb-4">
          Dont Worry You will be Login Soon.
        </DialogDescription>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Name</label>
            <Input defaultValue="Freja Johnsen" placeholder="Enter your full name" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input defaultValue="freja@example.com" placeholder="Enter your email" />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
        </div>
      </DialogContent>
      </DialogOverlay>
      </DialogPortal>
    </Dialog>
  );
};

export default ForgetPassword;
