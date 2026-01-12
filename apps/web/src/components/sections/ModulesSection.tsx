import { FC, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CryptoModule } from '@/components/modules/CryptoModule';
import { MemecoinModule } from '@/components/modules/MemecoinModule';
import { WeatherModule } from '@/components/modules/WeatherModule';
import { EsportsModule } from '@/components/modules/EsportsModule';
import { SportsModule } from '@/components/modules/SportsModule';
import { Confetti } from '@/components/ui/confetti';
import { useCreateFeed } from '@/hooks/useCreateFeed';
import { MODULE_TYPES } from '@/config/constants';
import { useQueryClient } from '@tanstack/react-query';

export const ModulesSection: FC = () => {
  const { createFeed, isModuleLoading, getModuleDeploymentState, showConfetti, setShowConfetti, getButtonText, canCreateOracle } = useCreateFeed();
  const queryClient = useQueryClient();
  const [, setSearchParams] = useSearchParams();

  const navigateToMyOracles = useCallback((feedPubkey?: string) => {
    queryClient.invalidateQueries({ queryKey: ['feeds'] });
    queryClient.invalidateQueries({ queryKey: ['my-feeds'] });
    queryClient.invalidateQueries({ queryKey: ['my-oracles'] });
    setSearchParams({ view: 'my-oracles', highlight: feedPubkey || '' });
  }, [queryClient, setSearchParams]);

  const handleCryptoCreate = async (config: { 
    symbol: string; 
    quoteCurrency: string;
    metric: string;
    resolutionDate: Date;
    title: string;
    logo?: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.CRYPTO,
      feedType: config.symbol,
      resolutionDate: config.resolutionDate,
      moduleId: 'crypto',
      config: { 
        symbol: config.symbol, 
        quoteCurrency: config.quoteCurrency,
        metric: config.metric,
        resolutionDate: config.resolutionDate.toISOString(),
        logo: config.logo,
      },
    });
    
    if (result) {
      navigateToMyOracles(result.feed_pubkey);
    }
  };

  const handleMemecoinCreate = async (config: { 
    contractAddress: string; 
    title: string;
    metric: string;
    resolutionDate: Date;
    tokenLogo?: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.MEMECOIN,
      feedType: 'dexscreener',
      resolutionDate: config.resolutionDate,
      moduleId: 'memecoin',
      config: { 
        contractAddress: config.contractAddress,
        metric: config.metric,
        resolutionDate: config.resolutionDate.toISOString(),
        tokenLogo: config.tokenLogo,
      },
    });
    
    if (result) {
      navigateToMyOracles(result.feed_pubkey);
    }
  };

  const handleWeatherCreate = async (config: { 
    location: string; 
    lat: number;
    lon: number;
    metric: string;
    resolutionDate: Date;
    title: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.WEATHER,
      feedType: config.location,
      resolutionDate: config.resolutionDate,
      moduleId: 'weather',
      config: { 
        location: config.location,
        lat: config.lat,
        lon: config.lon,
        metric: config.metric,
        resolutionDate: config.resolutionDate.toISOString(),
      },
    });
    
    if (result) {
      navigateToMyOracles(result.feed_pubkey);
    }
  };

  const handleEsportsCreate = async (config: { 
    game: string; 
    gameName: string;
    matchId: string;
    marketType: string;
    resolutionDate: Date;
    title: string;
    team1Id: number;
    team2Id: number;
    scheduledAt: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.ESPORTS,
      feedType: config.game,
      resolutionDate: config.resolutionDate,
      moduleId: 'esports',
      config: { 
        game: config.game, 
        gameName: config.gameName,
        matchId: config.matchId,
        marketType: config.marketType,
        resolutionDate: config.resolutionDate.toISOString(),
        team1Id: config.team1Id,
        team2Id: config.team2Id,
        scheduledAt: config.scheduledAt,
        matchStatus: 'waiting', // Initial status - will be updated by watcher
      },
    });
    
    if (result) {
      navigateToMyOracles(result.feed_pubkey);
    }
  };

  return (
    <section id="modules">
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CryptoModule
            onCreateFeed={handleCryptoCreate}
            isLoading={isModuleLoading('crypto')}
            deploymentState={getModuleDeploymentState('crypto')}
            getButtonText={(text) => getButtonText(text, 'crypto')}
          />
          <MemecoinModule
            onCreateFeed={handleMemecoinCreate}
            isLoading={isModuleLoading('memecoin')}
            deploymentState={getModuleDeploymentState('memecoin')}
            getButtonText={(text) => getButtonText(text, 'memecoin')}
          />
          <WeatherModule
            onCreateFeed={handleWeatherCreate}
            isLoading={isModuleLoading('weather')}
            deploymentState={getModuleDeploymentState('weather')}
            getButtonText={(text) => getButtonText(text, 'weather')}
          />
          <EsportsModule
            onCreateFeed={handleEsportsCreate}
            isLoading={isModuleLoading('esports')}
            deploymentState={getModuleDeploymentState('esports')}
            getButtonText={(text) => getButtonText(text, 'esports')}
          />
          <SportsModule />
        </div>
      </div>
    </section>
  );
};
