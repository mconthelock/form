<?php

// Create this file.
// file: application/helpers/general_helper.php

if (!function_exists('value')) {
    /**
     * Return the default value of the given value.
     *
     * @param mixed $value
     *
     * @return mixed
     */
    function value($value)
    {
        return $value instanceof Closure ? $value() : $value;
    }
}

if (!function_exists('env')) {
    /**
     * Gets the value of an environment variable.
     *
     * @param string $key
     * @param mixed  $default
     *
     * @return mixed
     */
    function env($key, $default = null)
    {
        $value = getenv($key);

        if ($value === false) {
            return value($default);
        }

        switch (strtolower($value)) {
            case 'true':
            case '(true)':
                return true;
            case 'false':
            case '(false)':
                return false;
            case 'empty':
            case '(empty)':
                return '';
            case 'null':
            case '(null)':
                return;
        }

        if (($valueLength = strlen($value)) > 1 && $value[0] === '"' && $value[$valueLength - 1] === '"') {
            return substr($value, 1, -1);
        }

        return $value;
    }
}


if (!function_exists('base_uri')) {
    function base_uri()
    {
        return get_instance()->config->slash_item('base_uri');
    }
}

if (!function_exists('root_url')) {
    function root_url()
    {
        // array(3) { ["scheme"]=> string(5) "https" ["host"]=> string(40) "amecwebtest.mitsubishielevatorasia.co.th" ["path"]=> string(8) "/safety/" }
        $parsed_url = parse_url(base_url());
        return $parsed_url['scheme'] . "://" . $parsed_url['host'] . "/";
    }
}