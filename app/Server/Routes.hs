{-# LANGUAGE DataKinds #-}
{-# LANGUAGE TypeOperators #-}
module Server.Routes where

import Servant
import Api.Model

-- Define todas as rotas da API
type SaudeAPI =
       "usuarios" :> Get '[JSON] [Usuario]
  :<|> "usuarios" :> ReqBody '[JSON] Usuario :> Post '[JSON] Usuario
  :<|> "usuarios" :> Capture "id" Int :> Get '[JSON] Usuario
  :<|> "usuarios" :> Capture "id" Int :> "metricas" :> Get '[JSON] [Metrica]
  :<|> "usuarios" :> Capture "id" Int :> "metricas" :> ReqBody '[JSON] Metrica :> Post '[JSON] Metrica
  :<|> "usuarios" :> Capture "id" Int :> "alertas" :> Get '[JSON] [Alerta]

-- Junta todas as rotas
saudeAPI :: Proxy SaudeAPI
saudeAPI = Proxy