<?php
// Serve static files directly if they exist (images, css, js, php handlers)
$docroot = __DIR__;
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = realpath($docroot . $uri);

// If the requested file exists within the docroot and is a file with an extension, let PHP's built-in server serve it
if ($path && strpos($path, $docroot) === 0 && is_file($path) && pathinfo($path, PATHINFO_EXTENSION) !== '') {
    return false;
}

// Fallback to the main HTML
readfile($docroot . '/index.html');
