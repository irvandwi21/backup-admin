<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {

            $table->id();

            $table->string('order_code');

            $table->string('customer_name');

            $table->string('phone');

            $table->text('address');

            $table->string('product_name');

            $table->integer('qty');

            $table->integer('total_price');

            $table->string('payment_status');

            $table->string('shipping_status');

            $table->string('tracking_number')->nullable();

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};