// src/app/(shop)/checkout/_components/CheckoutForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { checkoutSchema } from "@/server/db/checkout-schema";
import { type addresses } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { usePayment, type PaymentMethod } from "@/utils/usePayment";
import { type z } from "zod";
import { AddressForm } from "./AddressForm";
import { PaymentMethodForm } from "./PaymentMethodForm";
import { type InferSelectModel } from "drizzle-orm";
import { forwardRef } from "react";

type Address = InferSelectModel<typeof addresses>;
type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  initialAddresses: Address[];
  selectedPayment: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  setIsSubmitting: (value: boolean) => void;
}

export const CheckoutForm = forwardRef<HTMLFormElement, CheckoutFormProps>(
  function CheckoutForm(
    {
      initialAddresses,
      selectedPayment,
      onPaymentMethodChange,
      setIsSubmitting,
    },
    ref,
  ) {
    const [selectedAddress, setSelectedAddress] = useState<string>("new");
    const [paymentDetails, setPaymentDetails] = useState<
      CheckoutFormValues["payment"]
    >({
      method: selectedPayment,
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    });

    const { processPayment } = usePayment();
    const { toast } = useToast();

    const createAddress = api.address.createAddress.useMutation({
      onSuccess: () => {
        toast({
          title: "Address saved",
          description: "Your address has been saved successfully.",
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to save address",
          description: error.message,
          variant: "destructive",
        });
      },
    });

    const form = useForm<CheckoutFormValues>({
      resolver: zodResolver(checkoutSchema),
      defaultValues: {
        contact: {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
        },
        address: {
          addressLineOne: "",
          addressLineTwo: "",
          city: "",
          state: "",
          country: "India",
          postalCode: "",
          type: "shipping",
        },
        payment: paymentDetails,
      },
    });

    const handlePaymentDetailsChange = (
      details: CheckoutFormValues["payment"],
    ) => {
      setPaymentDetails(details);
      form.setValue("payment", details, { shouldValidate: true });
      onPaymentMethodChange(details.method);
    };

    const onSubmit = async (values: CheckoutFormValues) => {
      try {
        setIsSubmitting(true);
        let addressId: number;

        if (selectedAddress === "new") {
          const newAddress = await createAddress.mutateAsync({
            ...values.address,
            ...values.contact,
          });
          addressId = newAddress.id;
        } else {
          addressId = parseInt(selectedAddress);
        }

        // Process payment with complete details
        await processPayment({
          method: values.payment.method,
          shippingAddressId: addressId,
          billingAddressId: addressId,
          details: values.payment,
        });
      } catch (error) {
        console.error("Checkout error:", error);
        toast({
          title: "Checkout Failed",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Form {...form}>
        <form
          ref={ref}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              {initialAddresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-4 font-medium">Select Delivery Address</h3>
                  <RadioGroup
                    value={selectedAddress}
                    onValueChange={setSelectedAddress}
                    className="space-y-3"
                  >
                    {initialAddresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={address.id.toString()}
                          id={`address-${address.id}`}
                        />
                        <label
                          htmlFor={`address-${address.id}`}
                          className="text-sm"
                        >
                          {address.addressLineOne}
                          {address.addressLineTwo &&
                            `, ${address.addressLineTwo}`}
                          , {address.city}, {address.state} -{" "}
                          {address.postalCode}
                        </label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="address-new" />
                      <label htmlFor="address-new" className="text-sm">
                        Add New Address
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {selectedAddress === "new" && <AddressForm form={form} />}
            </CardContent>
          </Card>

          <PaymentMethodForm
            value={paymentDetails}
            onChange={handlePaymentDetailsChange}
          />
        </form>
      </Form>
    );
  },
);
