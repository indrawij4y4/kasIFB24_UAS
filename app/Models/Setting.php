<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Get a setting value by key
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting value
     */
    public static function setValue(string $key, $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }

    /**
     * Check if any settings exist in the database
     */
    public static function hasAnySettings(): bool
    {
        return static::whereIn('key', ['weekly_fee', 'weeks_per_month'])
            ->orWhere('key', 'like', 'weekly_fee_%')
            ->exists();
    }

    /**
     * Get weekly fee (Global/Default)
     * Returns 0 if not configured
     */
    public static function getWeeklyFee(): int
    {
        $value = static::getValue('weekly_fee');
        return $value !== null ? (int) $value : 0;
    }

    /**
     * Get weeks per month (Global/Default)
     * Returns 4 as sensible default for weeks calculation
     */
    public static function getWeeksPerMonth(): int
    {
        $value = static::getValue('weeks_per_month');
        return $value !== null ? (int) $value : 4;
    }

    /**
     * Get weekly fee for specific period
     * Returns 0 if no settings configured for this period OR globally
     */
    public static function getPeriodFee(?int $month = null, ?int $year = null): int
    {
        if ($month && $year) {
            $key = "weekly_fee_{$year}_{$month}";
            $val = static::getValue($key);
            if ($val !== null) {
                return (int) $val;
            }
        }
        // Return global setting, or 0 if not set
        return static::getWeeklyFee();
    }

    /**
     * Get weeks per month for specific period
     */
    public static function getPeriodWeeks(?int $month = null, ?int $year = null): int
    {
        if ($month && $year) {
            $key = "weeks_per_month_{$year}_{$month}";
            $val = static::getValue($key);
            if ($val !== null) {
                return (int) $val;
            }
        }
        // Return global setting, or 4 as default for weeks
        return static::getWeeksPerMonth();
    }

    /**
     * Set setting for specific period
     */
    public static function setPeriodValue(string $baseKey, $value, int $month, int $year): void
    {
        $key = "{$baseKey}_{$year}_{$month}";
        static::setValue($key, $value);
    }
}
