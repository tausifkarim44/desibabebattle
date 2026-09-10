export type Celebrity = {
  name: string;
  aliases: string[];
  approved: boolean;
  rating: number;
  avatar: string;
};

export const celebrities: Celebrity[] = [
  {
    name: 'Alia Bhatt',
    aliases: ['Alia'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/alia-bhatt.jpg',
  },
  {
    name: 'Anushka Sharma',
    aliases: ['Anushka'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/anushka-sharma.jpg',
  },
  {
    name: 'Deepika Padukone',
    aliases: ['Deepika'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/deepika-padukone.jpg',
  },
  {
    name: 'Kareena Kapoor',
    aliases: ['Kareena'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/kareena-kapoor.jpg',
  },
  {
    name: 'Katrina Kaif',
    aliases: ['Katrina'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/katrina-kaif.jpg',
  },
  {
    name: 'Kiara Advani',
    aliases: ['Kiara'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/kiara-advani.jpg',
  },
  {
    name: 'Priyanka Chopra',
    aliases: ['Priyanka'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/priyanka-chopra.jpg',
  },
  {
    name: 'Shraddha Kapoor',
    aliases: ['Shraddha'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/shraddha-kapoor.jpg',
  },
    {
    name: 'Kriti Sanon',
    aliases: ['Kriti'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/kriti-sanon.jpg',
  },

  {
    name: 'Taapsee Pannu',
    aliases: ['Taapsee'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/taapsee-pannu.jpg',
  },

  {
    name: 'Disha Patani',
    aliases: ['Disha'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/disha-patani.jpg',
  },

  {
    name: 'Rashmika Mandanna',
    aliases: ['Rashmika'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/rashmika-mandanna.jpg',
  },

  {
    name: 'Janhvi Kapoor',
    aliases: ['Janhvi'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/janhvi-kapoor.jpg',
  },

  {
    name: 'Mrunal Thakur',
    aliases: ['Mrunal'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/mrunal-thakur.jpg',
  },

  {
    name: 'Triptii Dimri',
    aliases: ['Triptii'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/triptii-dimri.jpg',
  },

  {
    name: 'Samantha Ruth Prabhu',
    aliases: ['Samantha'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/samantha-ruth-prabhu.jpg',
  },
    {
    name: 'Aditi Rao Hydari',
    aliases: ['Aditi'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/aditi-rao-hydari.jpg',
  },

  {
    name: 'Aishwarya Rai',
    aliases: ['Aishwarya'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/aishwarya-rai.jpg',
  },

  {
    name: 'Pooja Hegde',
    aliases: ['Pooja'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/pooja-hegde.jpg',
  },

  {
    name: 'Sai Pallavi',
    aliases: ['Sai'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/sai-pallavi.jpg',
  },

  {
    name: 'Sobhita Dhulipala',
    aliases: ['Sobhita'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/sobhita-dhulipala.jpg',
  },

  {
    name: 'Tamannaah Bhatia',
    aliases: ['Tamannaah'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/tamannaah-bhatia.jpg',
  },

  {
    name: 'Nayanthara',
    aliases: ['Nayanthara'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/nayanthara.jpg',
  },

  {
    name: 'Madhuri Dixit',
    aliases: ['Madhuri'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/madhuri-dixit.jpg',
  },

  {
    name: 'Kajal Aggarwal',
    aliases: ['Kajal'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/kajal-aggarwal.jpg',
  },

  {
    name: 'Rakul Preet Singh',
    aliases: ['Rakul'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/rakul-preet-singh.jpg',
  },

  {
    name: 'Yami Gautam',
    aliases: ['Yami'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/yami-gautam.jpg',
  },

  {
    name: 'Bhumi Pednekar',
    aliases: ['Bhumi'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/bhumi-pednekar.jpg',
  },

  {
    name: 'Parineeti Chopra',
    aliases: ['Parineeti'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/parineeti-chopra.jpg',
  },

  {
    name: 'Vidya Balan',
    aliases: ['Vidya'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/vidya-balan.jpg',
  },

  {
    name: 'Trisha Krishnan',
    aliases: ['Trisha'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/trisha-krishnan.jpg',
  },

  {
    name: 'Keerthy Suresh',
    aliases: ['Keerthy'],
    approved: true,
    rating: 1500,
    avatar: '/avatars/keerthy-suresh.jpg',
  },
];
export const isApprovedCelebrity = (name: string): boolean => {
  const normalizedName = name.trim().toLowerCase();

return celebrities.some(
  (celebrity) =>
    celebrity.approved &&
    (
      celebrity.name.toLowerCase() === normalizedName ||
      celebrity.aliases.some(
        (alias) => alias.toLowerCase() === normalizedName
      )
    )
);
};