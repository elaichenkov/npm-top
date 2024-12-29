const fetchDownloadStatistics = async (packageName, period) => {
  try {
    if (period === 'all-time') {
      // Fetch package metadata to get the first published date
      const response = await fetch(`https://registry.npmjs.org/${packageName}`);
      const metadata = await response.json();
      const createdDate = new Date(metadata.data.time.created);
      const currentDate = new Date();

      if (createdDate > currentDate) {
        console.error(`Invalid date range for package: ${packageName}`);
        return 0;
      }

      let totalDownloads = 0;
      let tempDate = new Date(createdDate);

      // Iterate year by year and calculate total downloads
      while (tempDate <= currentDate) {
        const yearStart = tempDate.toISOString().split('T')[0];
        const nextYear = new Date(tempDate);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const yearEnd =
          nextYear > currentDate ? currentDate.toISOString().split('T')[0] : nextYear.toISOString().split('T')[0];

        if (new Date(yearStart) > new Date(yearEnd)) {
          console.error(`Invalid range detected: ${yearStart} to ${yearEnd}`);
          break;
        }

        const range = `${yearStart}:${yearEnd}`;
        try {
          const response = await fetch(`https://api.npmjs.org/downloads/range/${range}/${packageName}`);
          const data = await response.json();

          totalDownloads += data.downloads.reduce((sum, day) => sum + day.downloads, 0);
        } catch (error) {
          console.error(`Error fetching downloads for range ${range} of ${packageName}:`, error.message);
        }

        tempDate.setFullYear(tempDate.getFullYear() + 1);
      }

      return totalDownloads;
    }

    const response = await fetch(`https://api.npmjs.org/downloads/point/${period}/${packageName}`);
    const data = await response.json();

    return data.downloads;
  } catch (error) {
    console.error(`Error fetching downloads for ${packageName}:`, error.message);
    return 0;
  }
};

// Helper function to search for packages by keywords
const searchNpmPackages = async (keywords, size) => {
  try {
    const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=keywords:${keywords}&size=${size}`);
    const data = await response.json();

    console.log('Data:', data);
    return {
      totalPackages: data.total,
      packages: data.objects.map((obj) => ({
        name: obj.package.name,
        description: obj.package.description,
        version: obj.package.version,
        keywords: obj.package.keywords ?? [],
        license: obj.package.license,
        updated: new Date(obj.package.date).toLocaleDateString(),
        homepage: obj.package.links.homepage,
        repository: obj.package.links.repository,
        maintainer: `${obj.package.maintainers[0].username} <${obj.package.maintainers[0].email}>`,
      })),
    };
  } catch (error) {
    console.error(`Error searching packages with keywords '${keywords}':`, error.message);
    return { totalPackages: 0, packages: [] };
  }
};

const formatDownloads = (downloads) => {
  if (downloads >= 1_000_000_000) return `${(downloads / 1_000_000_000).toFixed(1)}B`;
  if (downloads >= 1_000_000) return `${(downloads / 1_000_000).toFixed(1)}M`;
  if (downloads >= 1_000) return `${(downloads / 1_000).toFixed(1)}K`;
  return downloads.toString();
};

module.exports = {
  fetchDownloadStatistics,
  searchNpmPackages,
  formatDownloads,
};
