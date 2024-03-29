const { logger } = require('sequelize/lib/utils/logger')

class AnimeService {
   getAnimeSubset(data, startIndex, count) {
      const resultData = data.slice(startIndex, startIndex + count)
      return resultData
   }

   removeDuplicates(array, key) {
      const uniqueAnime = new Set()
      return array.filter((obj) => {
         if (!uniqueAnime.has(obj[key])) {
            uniqueAnime.add(obj[key])
            return true
         }
         return false
      })
   }

   sortByRating(data) {
      data.sort((a, b) => {
         const ratingA = a?.material_data?.shikimori_rating ?? 0
         const ratingB = b?.material_data?.shikimori_rating ?? 0

         return ratingB - ratingA
      })

      return data
   }

   findAnime(data, searchText) {
      const lowerCaseSearchText = searchText.trim().toLowerCase()
      const searchedData = data.filter((anime) => {
         return anime?.title.toLowerCase().trim().includes(lowerCaseSearchText)
      })
      return searchedData
   }

   replaceSpecificNames(title) {
      const specificNames = [
         { '[ТВ]': '' },
         { '[ТВ-1]': '' },
         { '[ТВ-2]': ' 2' },
         { '[ТВ-3]': ' 3' },
         { '[ТВ-4]': ' 4' },
         { '[ТВ-5]': ' 5' },
         { '[ТВ-6]': ' 6' },
         { '[ТВ-7]': ' 7' },
         { '[ТВ-8]': ' 8' },
         { '[ТВ-9]': ' 9' },
         { '[ТВ-10]': ' 10' },
         { '[ТВ-11]': ' 11' },
         { '[ТВ-12]': ' 12' },
         { '[ТВ-13]': ' 13' },
         { '[ТВ-14]': ' 14' },
         { '[ТВ, часть 1]': 'сезон 1, часть 1' },
         { '[ТВ-1, часть 1]': 'сезон 1, часть 1' },
         { '[ТВ-1, часть 2]': 'сезон 1, часть 2' },
         { '[ТВ-2, часть 1]': 'сезон 2, часть 1' },
         { '[ТВ-2, часть 2]': 'сезон 2, часть 2' },
         { '[ТВ-3, часть 1]': 'сезон 3, часть 1' },
         { '[ТВ-3, часть 2]': 'сезон 3, часть 2' },
         { '[ТВ-3, часть 3]': 'сезон 3, часть 3' },
      ]

      let replacedTitle = title
      specificNames.forEach((specificName) => {
         const nameToReplace = Object.keys(specificName)[0]
         const replacement = specificName[nameToReplace]
         replacedTitle = replacedTitle.replace(nameToReplace, replacement)
      })
      return replacedTitle
   }
}

module.exports = new AnimeService()
