import { FC, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CryptoModule } from '@/components/modules/CryptoModule';
import { MemecoinModule } from '@/components/modules/MemecoinModule';
import { WeatherModule } from '@/components/modules/WeatherModule';
import { EsportsModule } from '@/components/modules/EsportsModule';
import { SportsModule } from '@/components/modules/SportsModule';
import { SocialModule } from '@/components/modules/SocialModule';
import { LaunchpadModule } from '@/components/modules/LaunchpadModule';
import { MoviesModule } from '@/components/modules/MoviesModule';
import CosmosModule from '@/components/modules/CosmosModule';
import SteamModule from '@/components/modules/SteamModule';
import { PoliticsModule } from '@/components/modules/PoliticsModule';
import { EconomyModule } from '@/components/modules/EconomyModule';
import { AwardsModule } from '@/components/modules/AwardsModule';
import { LegalModule } from '@/components/modules/LegalModule';
import { CustomPredictionModule } from '@/components/modules/CustomPredictionModule';
import { Confetti } from '@/components/ui/confetti';
import { useCreateFeed } from '@/hooks/useCreateFeed';
import { MODULE_TYPES } from '@/config/constants';
import { useQueryClient } from '@tanstack/react-query';
import { TweetMetrics } from '@/services/socialDataService';

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
    chain?: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.MEMECOIN,
      feedType: 'geckoterminal',
      resolutionDate: config.resolutionDate,
      moduleId: 'memecoin',
      config: { 
        contractAddress: config.contractAddress,
        metric: config.metric,
        chain: config.chain || 'solana',
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

  const handleSportsCreate = async (config: { 
    sport: string;
    sportKey: string;
    eventId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    resolutionDate: Date;
    title: string;
    commenceTime: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.SPORTS,
      feedType: config.sport,
      resolutionDate: config.resolutionDate,
      moduleId: 'sports',
      config: { 
        sport: config.sport,
        sportKey: config.sportKey,
        eventId: config.eventId,
        homeTeam: config.homeTeam,
        awayTeam: config.awayTeam,
        league: config.league,
        resolutionDate: config.resolutionDate.toISOString(),
        commenceTime: config.commenceTime,
        matchStatus: 'waiting', // Initial status - will be updated by watcher
      },
    });
    
    if (result) {
      navigateToMyOracles(result.feed_pubkey);
    }
  };

  const handleSocialCreate = async (config: { 
    tweetUrl: string;
    metric: 'likes' | 'retweets';
    resolutionDate: Date;
    title: string;
    tweetData: TweetMetrics;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.SOCIAL,
      feedType: 'twitter',
      resolutionDate: config.resolutionDate,
      moduleId: 'social',
      config: { 
        tweetUrl: config.tweetUrl,
        metric: config.metric,
        resolutionDate: config.resolutionDate.toISOString(),
        // Serialize tweetData to plain JSON object
        tweetAuthor: config.tweetData.username,
        tweetAuthorName: config.tweetData.displayName,
        tweetAuthorAvatar: config.tweetData.avatarUrl,
        tweetContent: config.tweetData.tweetText,
        tweetId: config.tweetData.tweetId,
        isVerified: config.tweetData.isVerified,
      },
    });
    
    if (result) {
      navigateToMyOracles(result.feed_pubkey);
    }
  };

  const handleLaunchpadCreate = async (config: {
    launchpad: 'pumpfun' | 'letsbonk';
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    tokenImage: string | null;
    initialProgress: number;
    resolutionDate: Date;
    title: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.LAUNCHPAD,
      feedType: config.launchpad,
      resolutionDate: config.resolutionDate,
      moduleId: 'launchpad',
      config: {
        launchpad: config.launchpad,
        tokenAddress: config.tokenAddress,
        tokenSymbol: config.tokenSymbol,
        tokenName: config.tokenName,
        tokenImage: config.tokenImage,
        initialProgress: config.initialProgress,
        currentProgress: config.initialProgress,
        isGraduated: false,
        graduatedAt: null,
        resolutionDate: config.resolutionDate.toISOString(),
        matchStatus: 'waiting', // Uses same pattern as esports/sports for settlement trigger
      },
    });

    if (result) {
      navigateToMyOracles(result.feed_pubkey);
    }
  };

  const handleMoviesCreate = async (config: {
    movieId: number;
    movieTitle: string;
    posterPath: string | null;
    metric: 'vote_average' | 'popularity';
    currentValue: number;
    resolutionDate: Date;
    title: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.MOVIES,
      feedType: 'tmdb',
      resolutionDate: config.resolutionDate,
      moduleId: 'movies',
      config: {
        movieId: config.movieId,
        movieTitle: config.movieTitle,
        posterPath: config.posterPath,
        metric: config.metric,
        currentValue: config.currentValue,
        resolutionDate: config.resolutionDate.toISOString(),
      },
    });

    if (result) {
      navigateToMyOracles(result.feed_pubkey);
    }
  };

  const handleCosmosCreate = async (config: {
    launchId: string;
    launchName: string;
    rocket: string;
    provider: string;
    location: string;
    launchTime: string;
    condition: 'success' | 'scrubbed' | 'booster_landed';
    resolutionDate: Date;
    title: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.COSMOS,
      feedType: 'launch',
      resolutionDate: config.resolutionDate,
      moduleId: 'cosmos',
      config: {
        launchId: config.launchId,
        launchName: config.launchName,
        rocket: config.rocket,
        provider: config.provider,
        location: config.location,
        launchTime: config.launchTime,
        condition: config.condition,
        resolutionDate: config.resolutionDate.toISOString(),
      },
    });

    if (result) {
      navigateToMyOracles(result.feed_pubkey);
    }
  };

  const handleSteamCreate = async (config: {
    appId: number;
    gameName: string;
    targetCcu: number;
    currentCcu: number;
    resolutionDate: Date;
    title: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.STEAM,
      feedType: 'players',
      resolutionDate: config.resolutionDate,
      moduleId: 'steam',
      config: {
        appId: config.appId,
        gameName: config.gameName,
        targetCcu: config.targetCcu,
        currentCcu: config.currentCcu,
        resolutionDate: config.resolutionDate.toISOString(),
      },
    });

    if (result) {
      navigateToMyOracles(result.feed_pubkey);
    }
  };

  // AI-powered module handlers
  const handlePoliticsCreate = async (config: {
    eventType: string;
    region: string;
    question: string;
    additionalContext: string;
    resolutionDate: Date;
    title: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.POLITICS,
      feedType: config.eventType,
      resolutionDate: config.resolutionDate,
      moduleId: 'politics',
      config: {
        eventType: config.eventType,
        region: config.region,
        question: config.question,
        additionalContext: config.additionalContext,
        resolutionDate: config.resolutionDate.toISOString(),
        aiPowered: true,
      },
    });
    if (result) navigateToMyOracles(result.feed_pubkey);
  };

  const handleEconomyCreate = async (config: {
    indicator: string;
    dataSource: string;
    period: string;
    question: string;
    resolutionDate: Date;
    title: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.ECONOMY,
      feedType: config.indicator,
      resolutionDate: config.resolutionDate,
      moduleId: 'economy',
      config: {
        indicator: config.indicator,
        dataSource: config.dataSource,
        period: config.period,
        question: config.question,
        resolutionDate: config.resolutionDate.toISOString(),
        aiPowered: true,
      },
    });
    if (result) navigateToMyOracles(result.feed_pubkey);
  };

  const handleAwardsCreate = async (config: {
    awardShow: string;
    category: string;
    year: number;
    question: string;
    nominee?: string;
    resolutionDate: Date;
    title: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.AWARDS,
      feedType: config.awardShow,
      resolutionDate: config.resolutionDate,
      moduleId: 'awards',
      config: {
        awardShow: config.awardShow,
        category: config.category,
        year: config.year,
        question: config.question,
        nominee: config.nominee,
        resolutionDate: config.resolutionDate.toISOString(),
        aiPowered: true,
      },
    });
    if (result) navigateToMyOracles(result.feed_pubkey);
  };

  const handleLegalCreate = async (config: {
    caseType: string;
    caseName: string;
    court: string;
    parties: string;
    question: string;
    resolutionDate: Date;
    title: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.LEGAL,
      feedType: config.caseType,
      resolutionDate: config.resolutionDate,
      moduleId: 'legal',
      config: {
        caseType: config.caseType,
        caseName: config.caseName,
        court: config.court,
        parties: config.parties,
        question: config.question,
        resolutionDate: config.resolutionDate.toISOString(),
        aiPowered: true,
      },
    });
    if (result) navigateToMyOracles(result.feed_pubkey);
  };

  const handleCustomPredictionCreate = async (config: {
    question: string;
    additionalContext: string;
    sources: string[];
    resolutionDate: Date;
    title: string;
  }) => {
    const result = await createFeed({
      title: config.title,
      module: MODULE_TYPES.CUSTOM,
      feedType: 'custom',
      resolutionDate: config.resolutionDate,
      moduleId: 'custom',
      config: {
        question: config.question,
        additionalContext: config.additionalContext,
        sources: config.sources,
        resolutionDate: config.resolutionDate.toISOString(),
        aiPowered: true,
      },
    });
    if (result) navigateToMyOracles(result.feed_pubkey);
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
          <SportsModule
            onCreateFeed={handleSportsCreate}
            isLoading={isModuleLoading('sports')}
            deploymentState={getModuleDeploymentState('sports')}
            getButtonText={(text) => getButtonText(text, 'sports')}
          />
          <SocialModule
            onCreateFeed={handleSocialCreate}
            isLoading={isModuleLoading('social')}
            deploymentState={getModuleDeploymentState('social')}
            getButtonText={(text) => getButtonText(text, 'social')}
          />
          <LaunchpadModule
            onCreateFeed={handleLaunchpadCreate}
            isLoading={isModuleLoading('launchpad')}
            deploymentState={getModuleDeploymentState('launchpad')}
            getButtonText={(text) => getButtonText(text, 'launchpad')}
          />
          <MoviesModule
            onCreateFeed={handleMoviesCreate}
            isLoading={isModuleLoading('movies')}
            deploymentState={getModuleDeploymentState('movies')}
            getButtonText={(text) => getButtonText(text, 'movies')}
          />
          <CosmosModule
            onCreateFeed={handleCosmosCreate}
            isLoading={isModuleLoading('cosmos')}
            deploymentState={getModuleDeploymentState('cosmos')}
            getButtonText={(text) => getButtonText(text, 'cosmos')}
          />
          <SteamModule
            onCreateFeed={handleSteamCreate}
            isLoading={isModuleLoading('steam')}
            deploymentState={getModuleDeploymentState('steam')}
            getButtonText={(text) => getButtonText(text, 'steam')}
          />
          {/* AI-Powered Modules */}
          <PoliticsModule
            onCreateFeed={handlePoliticsCreate}
            isLoading={isModuleLoading('politics')}
            deploymentState={getModuleDeploymentState('politics')}
            getButtonText={(text) => getButtonText(text, 'politics')}
          />
          <EconomyModule
            onCreateFeed={handleEconomyCreate}
            isLoading={isModuleLoading('economy')}
            deploymentState={getModuleDeploymentState('economy')}
            getButtonText={(text) => getButtonText(text, 'economy')}
          />
          <AwardsModule
            onCreateFeed={handleAwardsCreate}
            isLoading={isModuleLoading('awards')}
            deploymentState={getModuleDeploymentState('awards')}
            getButtonText={(text) => getButtonText(text, 'awards')}
          />
          <LegalModule
            onCreateFeed={handleLegalCreate}
            isLoading={isModuleLoading('legal')}
            deploymentState={getModuleDeploymentState('legal')}
            getButtonText={(text) => getButtonText(text, 'legal')}
          />
          <CustomPredictionModule
            onCreateFeed={handleCustomPredictionCreate}
            isLoading={isModuleLoading('custom')}
            deploymentState={getModuleDeploymentState('custom')}
            getButtonText={(text) => getButtonText(text, 'custom')}
          />
        </div>
      </div>
    </section>
  );
};
