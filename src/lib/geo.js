// Kenya geographic reference (representative subset — extensible).
// Each county -> constituencies -> wards.
export const GEO = {
  Nairobi: {
    constituencies: {
      'Westlands': ['Parklands', 'Kasarani', 'Ruaraka'],
      'Langata': ['Karen', 'South B', 'Madaraka'],
      'Embakasi East': ['Embakasi', 'Utawala', 'Mihango'],
    'Kasarani': ['Kasarani', 'Njiru', 'Ruai', 'Mwiki', 'Clay City', 'Mihango', 'Saika'],
    },
  },
  Kiambu: {
    constituencies: {
      'Kiambu Town': ['Ndumberi', 'Riabai', 'Kihara'],
      'Thika Town': ['Hospital', 'Jamhuri', 'Kamenu'],
      'Kikuyu': ['Kikuyu', 'Sigona', 'Karai'],
    },
  },
  Mombasa: {
    constituencies: {
      'Mvita': ['Mji wa Kale', 'Shimanzi', 'Tononoka'],
      'Kisauni': ['Mjambere', 'Magogoni', 'Bamburi'],
      'Nyali': ['Kongowea', 'Ziwa la Ngombe', 'Kadongo'],
    },
  },
  Kisumu: {
    constituencies: {
      'Kisumu Central': ['Kajulu', 'Nyalenda', 'Milimani'],
      'Kisumu East': ['Kolwa', 'Nyamasaria', 'Manyatta'],
      'Nyando': ['Awasi', 'Ahero', 'Miwani'],
    },
  },
  Nakuru: {
    constituencies: {
      'Nakuru Town East': ['Menengai', 'Biashara', 'Milimani'],
      'Nakuru Town West': ['Barut', 'London', 'Shabaab'],
      'Naivasha': ['Mai Mahiu', 'Biashara', 'Karagita'],
    },
  },
};

export const COUNTIES = Object.keys(GEO);

export function constituenciesFor(county) {
  return county && GEO[county] ? Object.keys(GEO[county].constituencies) : [];
}

export function wardsFor(county, constituency) {
  if (!county || !constituency || !GEO[county]) return [];
  return GEO[county].constituencies[constituency] || [];
}

// Communities per ward — used to populate the community dropdown in the registration form.
export const COMMUNITIES = {
  Nairobi: {
    Kasarani: {
      'Kasarani': ['Kasarani Estate', 'Sunton', 'Mwiki', 'Clayworks', 'Hunters', 'Githurai 45'],
      'Njiru': ['Njiru Town', 'Kamulu', 'Joska', 'Saika Estate', 'Mihango', 'Fedha', 'Hunters', 'Gitaru'],
      'Ruai': ['Ruai Town', 'Kamulu', 'Joska', 'Njiru', 'Fedha'],
      'Mwiki': ['Mwiki', 'Sunton', 'Kasarani Estate', 'Clayworks'],
      'Clay City': ['Clay City', 'Clayworks', 'Mwiki', 'Hunters'],
      'Mihango': ['Mihango', 'Saika Estate', 'Fedha', 'Njiru'],
      'Saika': ['Saika Estate', 'Saika', 'Mihango', 'Fedha'],
    },
  },
};

export function communitiesFor(county, constituency, ward) {
  if (!county || !constituency || !ward) return [];
  return COMMUNITIES[county]?.[constituency]?.[ward] || [];
}