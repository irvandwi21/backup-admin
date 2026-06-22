<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [

        'order_code',

        'customer_name',

        'phone',

        'address',

        'product_name',

        'qty',

        'total_price',

        'payment_status',

        'shipping_status',

        'tracking_number'

    ];
}