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

  :<|> "usuarios" :> Capture "id" Int :> ReqBody '[JSON] Usuario :> Put '[JSON] Usuario
  :<|> "usuarios" :> Capture "id" Int :> Delete '[JSON] NoContent

  :<|> "usuarios" :> Capture "id" Int :> "metricas" :> Get '[JSON] [Metrica]
  :<|> "usuarios" :> Capture "id" Int :> "metricas" :> ReqBody '[JSON] Metrica :> Post '[JSON] Metrica

  :<|> "metricas" :> Capture "id" Int :> ReqBody '[JSON] Metrica :> Put '[JSON] Metrica
  :<|> "metricas" :> Capture "id" Int :> Delete '[JSON] NoContent

  :<|> "usuarios" :> Capture "id" Int :> "alertas" :> Get '[JSON] [Alerta]

  :<|> "alertas" :> Capture "id" Int :> Delete '[JSON] NoContent


-- Junta todas as rotas
saudeAPI :: Proxy SaudeAPI
saudeAPI = Proxy