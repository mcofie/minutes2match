declare global {
  const DiscordColors: typeof import('../../server/utils/discord').DiscordColors
  const SENDER_ID: typeof import('../../server/utils/zend').SENDER_ID
  const ZEND_BASE_URL: typeof import('../../server/utils/zend').ZEND_BASE_URL
  const __buildAssetsURL: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/paths').buildAssetsURL
  const __publicAssetsURL: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/paths').publicAssetsURL
  const appendCorsHeaders: typeof import('../../node_modules/h3').appendCorsHeaders
  const appendCorsPreflightHeaders: typeof import('../../node_modules/h3').appendCorsPreflightHeaders
  const appendHeader: typeof import('../../node_modules/h3').appendHeader
  const appendHeaders: typeof import('../../node_modules/h3').appendHeaders
  const appendResponseHeader: typeof import('../../node_modules/h3').appendResponseHeader
  const appendResponseHeaders: typeof import('../../node_modules/h3').appendResponseHeaders
  const assertMethod: typeof import('../../node_modules/h3').assertMethod
  const auditProfileWithAI: typeof import('../../server/utils/ai').auditProfileWithAI
  const cachedEventHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').cachedEventHandler
  const cachedFunction: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').cachedFunction
  const calculatePersona: typeof import('../../server/utils/personas').calculatePersona
  const callNodeListener: typeof import('../../node_modules/h3').callNodeListener
  const checkRateLimit: typeof import('../../server/utils/rateLimiter').checkRateLimit
  const clearResponseHeaders: typeof import('../../node_modules/h3').clearResponseHeaders
  const clearSession: typeof import('../../node_modules/h3').clearSession
  const createApp: typeof import('../../node_modules/h3').createApp
  const createAppEventHandler: typeof import('../../node_modules/h3').createAppEventHandler
  const createError: typeof import('../../node_modules/h3').createError
  const createEvent: typeof import('../../node_modules/h3').createEvent
  const createEventStream: typeof import('../../node_modules/h3').createEventStream
  const createRouter: typeof import('../../node_modules/h3').createRouter
  const defaultContentType: typeof import('../../node_modules/h3').defaultContentType
  const defineAppConfig: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/config').defineAppConfig
  const defineCachedEventHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').defineCachedEventHandler
  const defineCachedFunction: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').defineCachedFunction
  const defineEventHandler: typeof import('../../node_modules/h3').defineEventHandler
  const defineLazyEventHandler: typeof import('../../node_modules/h3').defineLazyEventHandler
  const defineNitroErrorHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/error/utils').defineNitroErrorHandler
  const defineNitroPlugin: typeof import('../../node_modules/nitropack/dist/runtime/internal/plugin').defineNitroPlugin
  const defineNodeListener: typeof import('../../node_modules/h3').defineNodeListener
  const defineNodeMiddleware: typeof import('../../node_modules/h3').defineNodeMiddleware
  const defineRenderHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/renderer').defineRenderHandler
  const defineRequestMiddleware: typeof import('../../node_modules/h3').defineRequestMiddleware
  const defineResponseMiddleware: typeof import('../../node_modules/h3').defineResponseMiddleware
  const defineRouteMeta: typeof import('../../node_modules/nitropack/dist/runtime/internal/meta').defineRouteMeta
  const defineTask: typeof import('../../node_modules/nitropack/dist/runtime/internal/task').defineTask
  const defineWebSocket: typeof import('../../node_modules/h3').defineWebSocket
  const defineWebSocketHandler: typeof import('../../node_modules/h3').defineWebSocketHandler
  const deleteCookie: typeof import('../../node_modules/h3').deleteCookie
  const dynamicEventHandler: typeof import('../../node_modules/h3').dynamicEventHandler
  const enforceRateLimit: typeof import('../../server/utils/rateLimiter').enforceRateLimit
  const eventHandler: typeof import('../../node_modules/h3').eventHandler
  const extractPreferencesFromBio: typeof import('../../server/utils/ai').extractPreferencesFromBio
  const fetchWithEvent: typeof import('../../node_modules/h3').fetchWithEvent
  const fromNodeMiddleware: typeof import('../../node_modules/h3').fromNodeMiddleware
  const fromPlainHandler: typeof import('../../node_modules/h3').fromPlainHandler
  const fromWebHandler: typeof import('../../node_modules/h3').fromWebHandler
  const generateMatchExplanation: typeof import('../../server/utils/ai').generateMatchExplanation
  const getClientIP: typeof import('../../server/utils/rateLimiter').getClientIP
  const getCookie: typeof import('../../node_modules/h3').getCookie
  const getGeminiModel: typeof import('../../server/utils/ai').getGeminiModel
  const getHeader: typeof import('../../node_modules/h3').getHeader
  const getHeaders: typeof import('../../node_modules/h3').getHeaders
  const getMethod: typeof import('../../node_modules/h3').getMethod
  const getProxyRequestHeaders: typeof import('../../node_modules/h3').getProxyRequestHeaders
  const getQuery: typeof import('../../node_modules/h3').getQuery
  const getRequestFingerprint: typeof import('../../node_modules/h3').getRequestFingerprint
  const getRequestHeader: typeof import('../../node_modules/h3').getRequestHeader
  const getRequestHeaders: typeof import('../../node_modules/h3').getRequestHeaders
  const getRequestHost: typeof import('../../node_modules/h3').getRequestHost
  const getRequestIP: typeof import('../../node_modules/h3').getRequestIP
  const getRequestPath: typeof import('../../node_modules/h3').getRequestPath
  const getRequestProtocol: typeof import('../../node_modules/h3').getRequestProtocol
  const getRequestURL: typeof import('../../node_modules/h3').getRequestURL
  const getRequestWebStream: typeof import('../../node_modules/h3').getRequestWebStream
  const getResponseHeader: typeof import('../../node_modules/h3').getResponseHeader
  const getResponseHeaders: typeof import('../../node_modules/h3').getResponseHeaders
  const getResponseStatus: typeof import('../../node_modules/h3').getResponseStatus
  const getResponseStatusText: typeof import('../../node_modules/h3').getResponseStatusText
  const getRouteRules: typeof import('../../node_modules/nitropack/dist/runtime/internal/route-rules').getRouteRules
  const getRouterParam: typeof import('../../node_modules/h3').getRouterParam
  const getRouterParams: typeof import('../../node_modules/h3').getRouterParams
  const getSession: typeof import('../../node_modules/h3').getSession
  const getValidatedQuery: typeof import('../../node_modules/h3').getValidatedQuery
  const getValidatedRouterParams: typeof import('../../node_modules/h3').getValidatedRouterParams
  const handleCacheHeaders: typeof import('../../node_modules/h3').handleCacheHeaders
  const handleCors: typeof import('../../node_modules/h3').handleCors
  const isCorsOriginAllowed: typeof import('../../node_modules/h3').isCorsOriginAllowed
  const isError: typeof import('../../node_modules/h3').isError
  const isEvent: typeof import('../../node_modules/h3').isEvent
  const isEventHandler: typeof import('../../node_modules/h3').isEventHandler
  const isMethod: typeof import('../../node_modules/h3').isMethod
  const isPreflightRequest: typeof import('../../node_modules/h3').isPreflightRequest
  const isSamePhone: typeof import('../../server/utils/phone').isSamePhone
  const isStream: typeof import('../../node_modules/h3').isStream
  const isWebResponse: typeof import('../../node_modules/h3').isWebResponse
  const lazyEventHandler: typeof import('../../node_modules/h3').lazyEventHandler
  const nitroPlugin: typeof import('../../node_modules/nitropack/dist/runtime/internal/plugin').nitroPlugin
  const normalizeGhanaPhone: typeof import('../../server/utils/phone').normalizeGhanaPhone
  const notifyDiscord: typeof import('../../server/utils/discord').notifyDiscord
  const notifyError: typeof import('../../server/utils/discord').notifyError
  const notifyEventBooking: typeof import('../../server/utils/discord').notifyEventBooking
  const notifyLobbyReminder: typeof import('../../server/utils/discord').notifyLobbyReminder
  const notifyMatchUnlocked: typeof import('../../server/utils/discord').notifyMatchUnlocked
  const notifyNewSignup: typeof import('../../server/utils/discord').notifyNewSignup
  const notifyPaymentInitiated: typeof import('../../server/utils/discord').notifyPaymentInitiated
  const notifyPaymentSuccess: typeof import('../../server/utils/discord').notifyPaymentSuccess
  const notifyRedemption: typeof import('../../server/utils/discord').notifyRedemption
  const notifyUser: typeof import('../../server/utils/notify').notifyUser
  const notifyUserLogin: typeof import('../../server/utils/discord').notifyUserLogin
  const parseCookies: typeof import('../../node_modules/h3').parseCookies
  const parseMarkdown: typeof import('../../node_modules/@nuxtjs/mdc/dist/runtime/parser').parseMarkdown
  const parseTelegramInitData: typeof import('../../server/utils/telegram').parseTelegramInitData
  const personas: typeof import('../../server/utils/personas').personas
  const promisifyNodeListener: typeof import('../../node_modules/h3').promisifyNodeListener
  const proxyRequest: typeof import('../../node_modules/h3').proxyRequest
  const queryCollection: typeof import('../../node_modules/@nuxt/content/dist/runtime/nitro').queryCollection
  const queryCollectionItemSurroundings: typeof import('../../node_modules/@nuxt/content/dist/runtime/nitro').queryCollectionItemSurroundings
  const queryCollectionNavigation: typeof import('../../node_modules/@nuxt/content/dist/runtime/nitro').queryCollectionNavigation
  const queryCollectionSearchSections: typeof import('../../node_modules/@nuxt/content/dist/runtime/nitro').queryCollectionSearchSections
  const readBody: typeof import('../../node_modules/h3').readBody
  const readFormData: typeof import('../../node_modules/h3').readFormData
  const readMultipartFormData: typeof import('../../node_modules/h3').readMultipartFormData
  const readRawBody: typeof import('../../node_modules/h3').readRawBody
  const readValidatedBody: typeof import('../../node_modules/h3').readValidatedBody
  const removeResponseHeader: typeof import('../../node_modules/h3').removeResponseHeader
  const runTargetedMatching: typeof import('../../server/utils/matchmaker').runTargetedMatching
  const runTask: typeof import('../../node_modules/nitropack/dist/runtime/internal/task').runTask
  const sanitizeStatusCode: typeof import('../../node_modules/h3').sanitizeStatusCode
  const sanitizeStatusMessage: typeof import('../../node_modules/h3').sanitizeStatusMessage
  const sealSession: typeof import('../../node_modules/h3').sealSession
  const send: typeof import('../../node_modules/h3').send
  const sendError: typeof import('../../node_modules/h3').sendError
  const sendHubtelSMS: typeof import('../../server/utils/hubtel').sendHubtelSMS
  const sendIterable: typeof import('../../node_modules/h3').sendIterable
  const sendNoContent: typeof import('../../node_modules/h3').sendNoContent
  const sendProxy: typeof import('../../node_modules/h3').sendProxy
  const sendRedirect: typeof import('../../node_modules/h3').sendRedirect
  const sendSMS: typeof import('../../server/utils/sms').sendSMS
  const sendStream: typeof import('../../node_modules/h3').sendStream
  const sendTelegramMessage: typeof import('../../server/utils/telegram-bot').sendTelegramMessage
  const sendTelegramPhoto: typeof import('../../server/utils/telegram-bot').sendTelegramPhoto
  const sendTelegramVideo: typeof import('../../server/utils/telegram-bot').sendTelegramVideo
  const sendWebResponse: typeof import('../../node_modules/h3').sendWebResponse
  const sendZendBulkSMS: typeof import('../../server/utils/zend').sendZendBulkSMS
  const sendZendOTP: typeof import('../../server/utils/zend').sendZendOTP
  const sendZendSMS: typeof import('../../server/utils/zend').sendZendSMS
  const serveStatic: typeof import('../../node_modules/h3').serveStatic
  const setCookie: typeof import('../../node_modules/h3').setCookie
  const setHeader: typeof import('../../node_modules/h3').setHeader
  const setHeaders: typeof import('../../node_modules/h3').setHeaders
  const setResponseHeader: typeof import('../../node_modules/h3').setResponseHeader
  const setResponseHeaders: typeof import('../../node_modules/h3').setResponseHeaders
  const setResponseStatus: typeof import('../../node_modules/h3').setResponseStatus
  const setTelegramBotCommands: typeof import('../../server/utils/telegram-bot').setTelegramBotCommands
  const setTelegramWebhook: typeof import('../../server/utils/telegram-bot').setTelegramWebhook
  const splitCookiesString: typeof import('../../node_modules/h3').splitCookiesString
  const stringifyMarkdown: typeof import('../../node_modules/@nuxtjs/mdc/dist/runtime/stringify').stringifyMarkdown
  const stripEmojis: typeof import('../../server/utils/sms').stripEmojis
  const toEventHandler: typeof import('../../node_modules/h3').toEventHandler
  const toNodeListener: typeof import('../../node_modules/h3').toNodeListener
  const toPlainHandler: typeof import('../../node_modules/h3').toPlainHandler
  const toWebHandler: typeof import('../../node_modules/h3').toWebHandler
  const toWebRequest: typeof import('../../node_modules/h3').toWebRequest
  const unlockMatch: typeof import('../../server/utils/match').unlockMatch
  const unsealSession: typeof import('../../node_modules/h3').unsealSession
  const updateSession: typeof import('../../node_modules/h3').updateSession
  const useAppConfig: typeof import('../../node_modules/nitropack/dist/runtime/internal/config').useAppConfig
  const useBase: typeof import('../../node_modules/h3').useBase
  const useEvent: typeof import('../../node_modules/nitropack/dist/runtime/internal/context').useEvent
  const useImage: typeof import('../../node_modules/@nuxt/image/dist/runtime/server/utils/image').useImage
  const useNitroApp: typeof import('../../node_modules/nitropack/dist/runtime/internal/app').useNitroApp
  const usePasskeyUtils: typeof import('../../server/utils/passkeys').usePasskeyUtils
  const useRuntimeConfig: typeof import('../../node_modules/nitropack/dist/runtime/internal/config').useRuntimeConfig
  const useSession: typeof import('../../node_modules/h3').useSession
  const useStorage: typeof import('../../node_modules/nitropack/dist/runtime/internal/storage').useStorage
  const verifyTelegramData: typeof import('../../server/utils/telegram').verifyTelegramData
  const verifyZendOTP: typeof import('../../server/utils/zend').verifyZendOTP
  const writeEarlyHints: typeof import('../../node_modules/h3').writeEarlyHints
}
// for type re-export
declare global {
  // @ts-ignore
  export type { HubtelSMSResponse } from '../../server/utils/hubtel'
  import('../../server/utils/hubtel')
  // @ts-ignore
  export type { MatchCandidate } from '../../server/utils/matchmaker'
  import('../../server/utils/matchmaker')
  // @ts-ignore
  export type { Persona } from '../../server/utils/personas'
  import('../../server/utils/personas')
  // @ts-ignore
  export type { RateLimitConfig, RateLimitResult } from '../../server/utils/rateLimiter'
  import('../../server/utils/rateLimiter')
  // @ts-ignore
  export type { ZendSMSResponse, ZendBulkResponse, ZendOTPSendResponse, ZendOTPVerifyResponse } from '../../server/utils/zend'
  import('../../server/utils/zend')
}
export { useNitroApp } from 'nitropack/runtime/internal/app';
export { useRuntimeConfig, useAppConfig } from 'nitropack/runtime/internal/config';
export { defineNitroPlugin, nitroPlugin } from 'nitropack/runtime/internal/plugin';
export { defineCachedFunction, defineCachedEventHandler, cachedFunction, cachedEventHandler } from 'nitropack/runtime/internal/cache';
export { useStorage } from 'nitropack/runtime/internal/storage';
export { defineRenderHandler } from 'nitropack/runtime/internal/renderer';
export { defineRouteMeta } from 'nitropack/runtime/internal/meta';
export { getRouteRules } from 'nitropack/runtime/internal/route-rules';
export { useEvent } from 'nitropack/runtime/internal/context';
export { defineTask, runTask } from 'nitropack/runtime/internal/task';
export { defineNitroErrorHandler } from 'nitropack/runtime/internal/error/utils';
export { appendCorsHeaders, appendCorsPreflightHeaders, appendHeader, appendHeaders, appendResponseHeader, appendResponseHeaders, assertMethod, callNodeListener, clearResponseHeaders, clearSession, createApp, createAppEventHandler, createError, createEvent, createEventStream, createRouter, defaultContentType, defineEventHandler, defineLazyEventHandler, defineNodeListener, defineNodeMiddleware, defineRequestMiddleware, defineResponseMiddleware, defineWebSocket, defineWebSocketHandler, deleteCookie, dynamicEventHandler, eventHandler, fetchWithEvent, fromNodeMiddleware, fromPlainHandler, fromWebHandler, getCookie, getHeader, getHeaders, getMethod, getProxyRequestHeaders, getQuery, getRequestFingerprint, getRequestHeader, getRequestHeaders, getRequestHost, getRequestIP, getRequestPath, getRequestProtocol, getRequestURL, getRequestWebStream, getResponseHeader, getResponseHeaders, getResponseStatus, getResponseStatusText, getRouterParam, getRouterParams, getSession, getValidatedQuery, getValidatedRouterParams, handleCacheHeaders, handleCors, isCorsOriginAllowed, isError, isEvent, isEventHandler, isMethod, isPreflightRequest, isStream, isWebResponse, lazyEventHandler, parseCookies, promisifyNodeListener, proxyRequest, readBody, readFormData, readMultipartFormData, readRawBody, readValidatedBody, removeResponseHeader, sanitizeStatusCode, sanitizeStatusMessage, sealSession, send, sendError, sendIterable, sendNoContent, sendProxy, sendRedirect, sendStream, sendWebResponse, serveStatic, setCookie, setHeader, setHeaders, setResponseHeader, setResponseHeaders, setResponseStatus, splitCookiesString, toEventHandler, toNodeListener, toPlainHandler, toWebHandler, toWebRequest, unsealSession, updateSession, useBase, useSession, writeEarlyHints } from 'h3';
export { buildAssetsURL as __buildAssetsURL, publicAssetsURL as __publicAssetsURL } from '/Users/maxwellcofie/WebstormProjects/minutes2match/node_modules/@nuxt/nitro-server/dist/runtime/utils/paths';
export { defineAppConfig } from '/Users/maxwellcofie/WebstormProjects/minutes2match/node_modules/@nuxt/nitro-server/dist/runtime/utils/config';
export { useImage } from '/Users/maxwellcofie/WebstormProjects/minutes2match/node_modules/@nuxt/image/dist/runtime/server/utils/image';
export { queryCollection, queryCollectionSearchSections, queryCollectionNavigation, queryCollectionItemSurroundings } from '/Users/maxwellcofie/WebstormProjects/minutes2match/node_modules/@nuxt/content/dist/runtime/nitro';
export { parseMarkdown } from '/Users/maxwellcofie/WebstormProjects/minutes2match/node_modules/@nuxtjs/mdc/dist/runtime/parser';
export { stringifyMarkdown } from '/Users/maxwellcofie/WebstormProjects/minutes2match/node_modules/@nuxtjs/mdc/dist/runtime/stringify';
export { getGeminiModel, auditProfileWithAI, extractPreferencesFromBio, generateMatchExplanation } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/ai';
export { DiscordColors, notifyRedemption, notifyDiscord, notifyNewSignup, notifyPaymentInitiated, notifyPaymentSuccess, notifyMatchUnlocked, notifyEventBooking, notifyLobbyReminder, notifyError, notifyUserLogin } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/discord';
export { sendHubtelSMS } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/hubtel';
export { unlockMatch } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/match';
export { runTargetedMatching } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/matchmaker';
export { notifyUser } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/notify';
export { usePasskeyUtils } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/passkeys';
export { personas, calculatePersona } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/personas';
export { normalizeGhanaPhone, isSamePhone } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/phone';
export { checkRateLimit, getClientIP, enforceRateLimit } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/rateLimiter';
export { stripEmojis, sendSMS } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/sms';
export { sendTelegramMessage, sendTelegramPhoto, sendTelegramVideo, setTelegramWebhook, setTelegramBotCommands } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/telegram-bot';
export { verifyTelegramData, parseTelegramInitData } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/telegram';
export { sendZendSMS, sendZendBulkSMS, sendZendOTP, verifyZendOTP, ZEND_BASE_URL, SENDER_ID } from '/Users/maxwellcofie/WebstormProjects/minutes2match/server/utils/zend';