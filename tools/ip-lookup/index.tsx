'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { BentoSection } from '@/components/ui/BentoSection';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IPLocation {
  ip: string;
  success: boolean;
  type: string;
  continent: string;
  continent_code: string;
  country: string;
  country_code: string;
  region: string;
  region_code: string;
  city: string;
  latitude: number;
  longitude: number;
  is_eu: boolean;
  postal: string;
  calling_code: string;
  capital: string;
  borders: string;
  flag: {
    img: string;
    emoji: string;
    emoji_unicode: string;
  };
  connection: {
    asn: number;
    org: string;
    isp: string;
    domain: string;
  };
  timezone: {
    id: string;
    abbr: string;
    is_dst: boolean;
    offset: number;
    utc: string;
    current_time: string;
  };
}

export default function IPLookupTool() {
  const t = useTranslations('tools.ipLookup');
  const tCommon = useTranslations('common');

  const [searchIP, setSearchIP] = useState('');
  const [ipData, setIpData] = useState<IPLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch user's IP on mount
  useEffect(() => {
    fetchIPData();
  }, []);

  const fetchIPData = async (ip?: string) => {
    try {
      setLoading(true);
      const url = ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setIpData(data);
        if (!ip) {
          // Auto-fill search input with user's IP
          setSearchIP(data.ip);
        }
      } else {
        toast.error(t('invalidIP'));
        setIpData(null);
      }
    } catch (error) {
      toast.error(t('fetchError'));
      console.error('Error fetching IP data:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchIP.trim()) {
      toast.error(t('enterIP'));
      return;
    }
    fetchIPData(searchIP.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search Section */}
      <BentoSection>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Icon 
              name="Search" 
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-tertiary)]" 
            />
            <input
              type="text"
              value={searchIP}
              onChange={(e) => setSearchIP(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('searchPlaceholder')}
              className={cn(
                'h-12 w-full rounded-lg border bg-[var(--color-bg-primary)] pl-12 pr-4 text-[15px] transition-colors',
                'border-[var(--color-border-default)] text-[var(--color-text-primary)]',
                'placeholder:text-[var(--color-text-tertiary)]',
                'focus:border-orange-500 focus:outline-none focus:ring-0'
              )}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="h-12 px-6"
          >
            <Icon name="Compass" className="mr-2 h-4 w-4" />
            {t('search')}
          </Button>
        </div>
      </BentoSection>

      {/* Loading State */}
      {initialLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border-default)] border-t-orange-500" />
            <p className="text-sm text-[var(--color-text-tertiary)]">{tCommon('loading')}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!initialLoading && ipData && (
        <div className="flex flex-col gap-6">
          {/* IP Address Card */}
          <BentoSection className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900">
            {/* Rotating Globe Background */}
            <div className="absolute right-1/5 top-1/2 -translate-y-1/2 opacity-10">
              <Icon name="Earth" className="h-70 w-70 animate-spin text-slate-500" style={{ animationDuration: '20s' }} />
            </div>
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-400">{t('ipAddress')}</span>
                  {/* Online Status Indicator */}
                  <div className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">
                    {ipData.type}
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">
                    vNRT
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Icon name="MapPin" className="h-12 w-12 text-slate-500" />
                <h2 className="font-mono text-4xl font-bold text-white">
                  {ipData.ip}
                </h2>
              </div>
            </div>
          </BentoSection>

          {/* Location and Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Location Card */}
            <BentoSection>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Icon name="MapPin" className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold text-[var(--color-text-primary)]">
                    {t('location')}
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={ipData.flag.img} 
                      alt={ipData.country}
                      className="h-8 w-12 rounded object-cover shadow-sm"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-[var(--color-text-tertiary)]">{t('country')}</span>
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {ipData.country} {ipData.flag.emoji}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-[var(--color-text-tertiary)]">{t('region')}</span>
                      <p className="font-medium text-[var(--color-text-primary)]">{ipData.region}</p>
                    </div>
                    <div>
                      <span className="text-sm text-[var(--color-text-tertiary)]">{t('city')}</span>
                      <p className="font-medium text-[var(--color-text-primary)]">{ipData.city}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-[var(--color-text-tertiary)]">{t('continent')}</span>
                      <p className="font-medium text-[var(--color-text-primary)]">{ipData.continent}</p>
                    </div>
                    <div>
                      <span className="text-sm text-[var(--color-text-tertiary)]">{t('capital')}</span>
                      <p className="font-medium text-[var(--color-text-primary)]">{ipData.capital}</p>
                    </div>
                  </div>
                </div>
              </div>
            </BentoSection>

            {/* Connection Info Card */}
            <BentoSection>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Icon name="Network" className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold text-[var(--color-text-primary)]">
                    {t('connection')}
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-sm text-[var(--color-text-tertiary)]">{t('isp')}</span>
                    <p className="font-medium text-[var(--color-text-primary)]">{ipData.connection.isp}</p>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--color-text-tertiary)]">{t('organization')}</span>
                    <p className="font-medium text-[var(--color-text-primary)]">{ipData.connection.org}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-[var(--color-text-tertiary)]">{t('asn')}</span>
                      <p className="font-medium text-[var(--color-text-primary)]">{ipData.connection.asn}</p>
                    </div>
                    <div>
                      <span className="text-sm text-[var(--color-text-tertiary)]">{t('type')}</span>
                      <p className="font-medium text-[var(--color-text-primary)]">{ipData.connection.domain}</p>
                    </div>
                  </div>
                </div>
              </div>
            </BentoSection>
          </div>

          {/* Additional Info Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Timezone Card */}
            <BentoSection>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/10">
                    <Icon name="Clock" className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <span className="text-sm text-[var(--color-text-tertiary)]">{t('timezone')}</span>
                    <p className="font-semibold text-[var(--color-text-primary)]">
                      {ipData.timezone.id}
                    </p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-[var(--color-text-secondary)]">
                    UTC {ipData.timezone.utc}
                  </p>
                </div>
              </div>
            </BentoSection>

            {/* Coordinates Card */}
            <BentoSection>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/10">
                    <Icon name="Navigation" className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <span className="text-sm text-[var(--color-text-tertiary)]">{t('coordinates')}</span>
                    <p className="font-semibold text-[var(--color-text-primary)]">
                      {ipData.latitude}, {ipData.longitude}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {t('latitude')}: {ipData.latitude} • {t('longitude')}: {ipData.longitude}
                </div>
              </div>
            </BentoSection>

            {/* Calling Code Card */}
            <BentoSection>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/10">
                    <Icon name="Phone" className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <span className="text-sm text-[var(--color-text-tertiary)]">{t('callingCode')}</span>
                    <p className="font-semibold text-[var(--color-text-primary)]">
                      +{ipData.calling_code}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-[var(--color-text-secondary)]">
                  {t('dialingCode')}
                </div>
              </div>
            </BentoSection>
          </div>

          {/* Map Section */}
          <BentoSection>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Icon name="Map" className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-[var(--color-text-primary)]">
                  {t('mapLocation')}
                </h3>
              </div>
              <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-[var(--color-border-default)]">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${ipData.longitude - 0.1},${ipData.latitude - 0.1},${ipData.longitude + 0.1},${ipData.latitude + 0.1}&layer=mapnik&marker=${ipData.latitude},${ipData.longitude}`}
                ></iframe>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-text-tertiary)]">
                  {t('coordinates')}: {ipData.latitude}, {ipData.longitude}
                </span>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${ipData.latitude}&mlon=${ipData.longitude}#map=12/${ipData.latitude}/${ipData.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <span>{t('viewLargerMap')}</span>
                  <Icon name="ExternalLink" className="h-4 w-4" />
                </a>
              </div>
            </div>
          </BentoSection>
        </div>
      )}

      {/* No Results */}
      {!initialLoading && !loading && !ipData && (
        <BentoSection>
          <div className="flex flex-col items-center justify-center py-12">
            <Icon name="SearchX" className="mb-4 h-12 w-12 text-[var(--color-text-tertiary)]" />
            <p className="text-[var(--color-text-secondary)]">{t('noResults')}</p>
          </div>
        </BentoSection>
      )}
    </div>
  );
}
