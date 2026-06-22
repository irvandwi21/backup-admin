<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login');

Route::get('/admin', function () {
    return Inertia::render('AdminDashboard');
});

Route::get('/admin/orders', function () {
    return Inertia::render('Orders');
});

Route::get('/admin/shipping', function () {
    return Inertia::render('Shipping');
});

Route::get('/admin/users', function () {
    return Inertia::render('Users');
});

Route::get('/admin/reports', function () {
    return Inertia::render('Reports');
});

Route::get('/admin/settings', function () {
    return Inertia::render('Settings');
});

Route::get('/admin/products', function () {
    return Inertia::render('Products');
});

require __DIR__.'/auth.php';