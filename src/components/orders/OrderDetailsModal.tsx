import React from 'react';
import { X } from 'lucide-react';
import { Order, OrderStatus } from '../../types/order';
import Button from '../Button';
import OrderStatusBadge from './OrderStatusBadge';
import { getOrderItemsApi, patchOrderStatusApi } from '../../Api-Service/Apis';
import { InvalidateQueryFilters, useQuery, useQueryClient } from '@tanstack/react-query';

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
}

export default function OrderDetailsModal({ order, onClose, onUpdateStatus }: OrderDetailsModalProps) {
  const queryClient = useQueryClient();
  // getOrderItemsApi

  const { data, isLoading, error } = useQuery({
    queryKey: ["getOrderItemsData", order?.user, order?.vendor, order?.id],
    queryFn: () => getOrderItemsApi(`?user_id=${order?.user}&vendor_id=${order?.vendor}&order_id=${order?.id}`),
  })


  const handleUpadteStatus = async (val: any) => {
    try {
      const updateApi = await patchOrderStatusApi(order?.id,
        {
          status: val,
          updated_by: "vendor"
        }
      )
      if (updateApi) {
        queryClient.invalidateQueries(['getProductData'] as InvalidateQueryFilters);
      }
    } catch (error) {

    }
  }
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
          {isLoading ? (
            <>
              <div className="sm:flex sm:items-start animate-pulse">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>

                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-6 w-20 bg-gray-300 rounded"></div>
                    </div>

                    <div>
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="h-10 bg-gray-300 rounded"></div>
                    </div>

                    <div>
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>

                    <div>
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>

                    <div>
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="divide-y divide-gray-200">
                        {[...Array(3)].map((_, idx) => (
                          <div key={idx} className="py-3 flex justify-between">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-300 rounded mr-3"></div>
                              <div className="space-y-1">
                                <div className="h-4 bg-gray-300 rounded w-32"></div>
                              </div>
                            </div>
                            <div className="space-y-1 text-right">
                              <div className="h-4 bg-gray-300 rounded w-12"></div>
                              <div className="h-4 bg-gray-300 rounded w-16"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-base font-medium">
                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Order #{data?.data?.id}
                  </h3>

                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status</span>
                      <OrderStatusBadge status={data?.data?.status} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Update Status</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={data?.data?.status}
                        onChange={(e) => handleUpadteStatus(e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Customer Details</h4>
                      <div className="mt-2 text-sm">
                        <p>{data?.data?.consumer_address?.customer_name}</p>
                        <p>{data?.data?.consumer_address?.email_address}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Shipping Address</h4>
                      <div className="mt-2 text-sm">
                        <p>{data?.data?.consumer_address?.address_line1},{data?.data?.consumer_address?.address_line2}</p>
                        <p>{data?.data?.consumer_address?.city}, {data?.data?.consumer_address?.state} {data?.data?.consumer_address?.zipCode}</p>
                        <div className='flex gap-1'>
                          <p>{data?.data?.consumer_address?.country}</p>-<p>{data?.data?.consumer_address?.postal_code}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Order Items</h4>
                      <div className="mt-2 divide-y divide-gray-200">
                        {data?.data?.order_items?.map((item: any) => (
                          <div key={item.id} className="py-3 flex justify-between">
                            <div className="flex items-center">
                              {item.product?.image_urls[0] && (
                                <img src={item?.product?.image_urls[0]} className="h-10 w-10 rounded object-cover mr-3" />
                              )}
                              <div className="text-sm">
                                <p className="font-medium">{item?.product?.name}</p>
                                {/* <p className="text-gray-500">{item?.product?.color} - {item?.product?.size}</p> */}
                              </div>
                            </div>
                            <div className="text-sm">
                              <p> ₹{item?.price} × {item?.quantity}</p>
                              <p className="font-medium"> ₹{item?.price * item?.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-base font-medium">
                        <p>Total</p>
                        <p> ₹{data?.data?.total_amount}</p>
                      </div>
                    </div>

                        <div className="flex justify-between items-center">
                      <span className="text-base  font-medium">Payment Status</span>
                      <div className={`p-1 rounded-lg uppercase ${data?.data?.payment_status === 'paid' ? 'bg-green-200 text-green-700' :'bg-yellow-50 text-yellow-700'}`}>{data?.data?.payment_status} </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}


          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}