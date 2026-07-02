/**
 * 标签统计存储模块：维护最近添加、最常用等候选标签列表。
 * 主书签数据不在这里，这里只保存为了输入提示和菜单展示而派生出来的标签索引。
 */
import { getSettingsValue } from 'browser-extension-settings'
import {
  addValueChangeListener,
  getValue,
  setValue,
} from 'browser-extension-storage'
import { splitTags } from 'utags-utils'

import type { RecentTag } from '../types.js'

/**
 * Storage keys for different tag collections
 */

const STORAGE_KEY_RECENT_TAGS = 'extension.utags.recenttags'

const STORAGE_KEY_MOST_USED_TAGS = 'extension.utags.mostusedtags'

/**
 * Calculates a weighted score based on current timestamp
 * Used for tag ranking and sorting
 * @param weight Multiplier for the score calculation
 * @returns Normalized score value
 */
function getScore(weight = 1): number {
  return (Math.floor(Date.now() / 1000) / 1_000_000_000) * weight
}

/**
 * Adds new names to the recent names list and updates related collections
 * @param newNames Array of new names to add
 * @param oldNames Array of existing names to compare against
 */
export async function addRecentNames(
  newNames: string[],
  oldNames: string[]
): Promise<void> {
  if (newNames.length === 0) return

  // Filter out names that already exist in oldNames
  const uniqueNewNames =
    oldNames?.length > 0
      ? newNames.filter((name) => name && !oldNames.includes(name))
      : newNames.filter(Boolean)

  if (uniqueNewNames.length === 0) return

  // Retrieve existing recent names or initialize new array
  const recentTags: RecentTag[] = await getRecentTags()
  const score = getScore()

  // Add new names with current score
  for (const name of uniqueNewNames) {
    recentTags.push({ tag: name, score })
  }

  // Maintain maximum size of recent tags list
  if (recentTags.length > 1000) {
    recentTags.splice(0, 100) // Remove oldest 100 tags
  }

  // Update storage and related tag collections
  await setValue(STORAGE_KEY_RECENT_TAGS, recentTags)
  await generateMostUsedTags(recentTags)
}

/**
 * Generates most used tags from the recent tags collection
 * @param recentTags Array of recent tags with scores
 */
async function generateMostUsedTags(recentTags: RecentTag[]): Promise<void> {
  // Aggregate tag scores
  const tagScores: Record<string, RecentTag> = {}

  for (const recentTag of recentTags) {
    if (!recentTag.tag) {
      continue
    }

    if (tagScores[recentTag.tag]) {
      tagScores[recentTag.tag].score += recentTag.score
    } else {
      tagScores[recentTag.tag] = {
        tag: recentTag.tag,
        score: recentTag.score,
      }
    }
  }

  // Generate most used tags list
  const mostUsedTags = Object.values(tagScores)
    .filter((tag) => tag.score > getScore(1.5)) // Tags used at least twice
    .sort((a, b) => b.score - a.score)
    .map((tag) => tag.tag)
    .slice(0, 200) // Limit to top 200 tags

  await setValue(STORAGE_KEY_MOST_USED_TAGS, mostUsedTags)
}

export async function getRecentTags(): Promise<RecentTag[]> {
  const values = await getValue<RecentTag[]>(STORAGE_KEY_RECENT_TAGS)
  return Array.isArray(values) ? values : []
}

/**
 * Retrieves the list of most frequently used tags
 * @returns Array of most used tag strings
 */
export async function getMostUsedTags(): Promise<string[]> {
  const values = await getValue<string[]>(STORAGE_KEY_MOST_USED_TAGS)
  return Array.isArray(values) ? values : []
}

/**
 * Retrieves the list of pinned tags from settings
 * @returns Array of pinned tag strings
 */
export async function getPinnedTags(): Promise<string[]> {
  return splitTags(getSettingsValue('pinnedTags') || '')
}
