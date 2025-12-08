import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Button from '../../components/Button';
import { postCouponApi, updateCouponApi } from '../../Api-Service/authendication';
import { InvalidateQueryFilters, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

const CouponSchema = Yup.object().shape({
    code: Yup.string().required('Code is required'),
    description: Yup.string().required('Description is required'),
    start_date: Yup.string().required('Start date is required'),
    expiry_date: Yup.string().required('Expiry date is required'),
    discount_type: Yup.string().required('Discount type is required'),
    discount_value: Yup.number()
        .nullable()
        .when('discount_type', {
            is: 'percentage',
            then: (schema) => schema.required('Discount value is required').min(1).max(100),
            otherwise: (schema) => schema.strip(), // remove if not needed
        }),

    flat_discount: Yup.number()
        .nullable()
        .when('discount_type', {
            is: 'flat',
            then: (schema) => schema.required('Flat discount is required').min(1),
            otherwise: (schema) => schema.strip(),
        }),

    delivery_discount: Yup.number()
        .nullable()
        .when('discount_type', {
            is: 'delivery',
            then: (schema) => schema.required('Delivery discount is required').min(1),
            otherwise: (schema) => schema.strip(),
        }),
});

function CouponModal({ close, editData, userId }: any) {
    const queryClient = useQueryClient();
    const { id } = useParams();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(CouponSchema),
        defaultValues: {
            code: '',
            description: '',
            start_date: '',
            expiry_date: '',
            discount_type: '',
        },
    });

    useEffect(() => {
        if (editData) {
            setValue('code', editData.code || '');
            setValue('description', editData.description || '');
            setValue('start_date', editData.start_date?.split('T')[0] || ''); // trimming ISO date
            setValue('expiry_date', editData.expiry_date?.split('T')[0] || '');
            setValue('discount_type', editData.discount_type || '');

            // Conditionally set the correct discount field
            if (editData.discount_type === 'percentage') {
                setValue('discount_value', editData.discount_value || '');
            } else if (editData.discount_type === 'flat') {
                setValue('flat_discount', editData.flat_discount || '');
            } else if (editData.discount_type === 'delivery') {
                setValue('delivery_discount', editData.delivery_discount || '');
            }
        }
    }, [editData, setValue]);

    const onSubmit = async (data: any) => {
        try {
            if (editData) {
                const updateApi: any = await updateCouponApi(`${editData?.id}`, {
                    ...data, vendor: id, updated_by: 'vendor'
                })
                if (updateApi) {
                    queryClient.invalidateQueries(['getCouponData'] as InvalidateQueryFilters);
                    close();
                }
            } else {
                const updateApi: any = postCouponApi('', { ...data, vendor: id, created_by: 'vendor' })
                if (updateApi) {
                    queryClient.invalidateQueries(['getCouponData'] as InvalidateQueryFilters);
                    close();
                }
            }
        } catch (error: any) {
            const errors = error?.response?.data?.errors;
            let firstError = "";
            if (errors && typeof errors === "object") {
                const firstKey = Object.keys(errors)[0];
                firstError = errors[firstKey][0];
            }
            setErrorMessage(
                firstError ||
                error?.response?.data?.error ||
                "Something went wrong. Please try again."
            );
        }
    };

    const discountType = watch('discount_type');

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white w-full max-w-lg mx-auto rounded-lg p-6 shadow-lg overflow-y-auto max-h-[90vh]"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <h3 className="text-lg text-gray-900 mb-4 font-bold">{editData ? 'Edit' : 'Create'} Coupon</h3>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-2">
                        <label className="font-medium">Code</label>
                        <input {...register('code')} className="w-full border rounded px-3 py-2" />
                        {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
                    </div>

                    <div className="mb-2">
                        <label className="font-medium">Description</label>
                        <input {...register('description')} className="w-full border rounded px-3 py-2" />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                    </div>

                    <div className="mb-2">
                        <label className="font-medium">Start Date</label>
                        <input type="date" {...register('start_date')} className="w-full border rounded px-3 py-2" />
                        {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date.message}</p>}
                    </div>

                    <div className="mb-2">
                        <label className="font-medium">Expiry Date</label>
                        <input type="date" {...register('expiry_date')} className="w-full border rounded px-3 py-2" />
                        {errors.expiry_date && <p className="text-red-500 text-sm">{errors.expiry_date.message}</p>}
                    </div>

                    <div className="mb-2">
                        <label className="font-medium">Discount Type</label>
                        <select {...register('discount_type')} className="w-full border rounded px-3 py-2">
                            <option value="">Select Discount Type</option>
                            <option value="percentage">Percentage</option>
                            <option value="flat">Flat</option>
                            <option value="delivery">Delivery</option>
                        </select>
                        {errors.discount_type && <p className="text-red-500 text-sm">{errors.discount_type.message}</p>}
                    </div>

                    {discountType === 'percentage' && (
                        <div className="mb-2">
                            <label className="font-medium">Discount Value</label>
                            <input type='number' {...register('discount_value')} className="w-full border rounded px-3 py-2" />
                            {errors.discount_value && <p className="text-red-500 text-sm">{errors.discount_value.message}</p>}
                        </div>
                    )}

                    {discountType === 'flat' && (
                        <div className="mb-2">
                            <label className="font-medium">Flat Discount</label>
                            <input type='number' {...register('flat_discount')} className="w-full border rounded px-3 py-2" />
                            {errors.flat_discount && <p className="text-red-500 text-sm">{errors.flat_discount.message}</p>}
                        </div>
                    )}

                    {discountType === 'delivery' && (
                        <div className="mb-2">
                            <label className="font-medium">Delivery Discount</label>
                            <input type='number' {...register('delivery_discount')} className="w-full border rounded px-3 py-2" />
                            {errors.delivery_discount && <p className="text-red-500 text-sm">{errors.delivery_discount.message}</p>}
                        </div>
                    )}


                    {errorMessage && (
                        <p className="text-red-600 text-sm">{errorMessage}</p>
                    )}

                    <div className="mt-5 flex justify-end space-x-2">
                        <Button variant="secondary" onClick={close} type="button">
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editData ? 'Update' : 'Save'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CouponModal;
