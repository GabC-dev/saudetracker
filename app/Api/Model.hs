{-# LANGUAGE DeriveGeneric #-}
module Api.Model where

import Data.Aeson (ToJSON, FromJSON)
import GHC.Generics (Generic)
import Data.Time (UTCTime)

-- Usuário
data Usuario = Usuario
  { usuarioId :: Int
  , nome      :: String
  , idade     :: Int
  , altura    :: Double
  , email     :: String
  } deriving (Show, Eq, Generic)

instance ToJSON Usuario
instance FromJSON Usuario

-- Métrica registrada pelo usuário
data Metrica = Metrica
  { metricaId    :: Int
  , metricaUsuarioId :: Int
  , tipo         :: String
  , valor1       :: Double
  , valor2       :: Maybe Double
  , registradoEm :: UTCTime
  } deriving (Show, Eq, Generic)

instance ToJSON Metrica
instance FromJSON Metrica

-- Alerta gerado automaticamente
data Alerta = Alerta
  { alertaId        :: Int
  , alertaUsuarioId :: Int
  , mensagem        :: String
  , geradoEm        :: UTCTime
  } deriving (Show, Eq, Generic)

instance ToJSON Alerta
instance FromJSON Alerta