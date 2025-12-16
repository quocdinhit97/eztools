export interface NavItem {
  key: string;
  href: string;
  icon: string;
}

export const mainNavItems: NavItem[] = [
  { key: 'home', href: '/', icon: 'House' },
  { key: 'favorites', href: '/favorites', icon: 'Star' },
  { key: 'history', href: '/history', icon: 'History' },
  { key: 'settings', href: '/settings', icon: 'Settings' },
];
