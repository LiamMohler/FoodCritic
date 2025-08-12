import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Restaurants', href: '/restaurants', current: location.pathname === '/restaurants' },
    { name: 'Recent Reviews', href: '/recent-reviews', current: location.pathname === '/recent-reviews' },
  ];

  const userNavigation = [
    { name: 'Your Profile', href: '/profile' },
  ];

  return (
    <Disclosure as="nav" className="bg-blue-600 shadow-lg">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link to="/" className="text-white font-bold text-xl">
                    FoodCritic
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-secondary-900 text-white'
                            : 'text-secondary-300 hover:bg-secondary-700 hover:text-white',
                          'rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {user ? (
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex max-w-xs items-center rounded-full bg-secondary-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-secondary-800 transition-all duration-200">
                          <span className="sr-only">Open user menu</span>
                          <div className="h-8 w-8 rounded-full overflow-hidden bg-primary-500 flex items-center justify-center text-white font-medium">
                            {user.profilePhoto ? (
                              <img 
                                src={user.profilePhoto} 
                                alt={user.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              user.username?.charAt(0).toUpperCase()
                            )}
                          </div>
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-2xl bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  to={item.href}
                                  className={classNames(
                                    active ? 'bg-secondary-50' : '',
                                    'block px-4 py-2 text-sm text-secondary-700 hover:text-secondary-900 transition-colors duration-200'
                                  )}
                                >
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => logout()}
                                className={classNames(
                                  active ? 'bg-error-50' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-error-600 hover:text-error-700 transition-colors duration-200'
                                )}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <div className="flex space-x-4">
                      <Link
                        to="/login"
                        className="rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors duration-200"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="rounded-md bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-blue-600 p-2 text-blue-200 hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-colors duration-200">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    item.current ? 'bg-secondary-900 text-white' : 'text-secondary-300 hover:bg-secondary-700 hover:text-white',
                    'block rounded-xl px-3 py-2 text-base font-medium transition-colors duration-200'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            {user ? (
              <div className="border-t border-secondary-700 pb-3 pt-4">
                <div className="flex items-center px-5">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-primary-500 flex items-center justify-center text-white font-medium">
                    {user.profilePhoto ? (
                      <img 
                        src={user.profilePhoto} 
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">
                      {user.username}
                    </div>
                    <div className="text-sm font-medium leading-none text-secondary-400">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      to={item.href}
                      className="block rounded-xl px-3 py-2 text-base font-medium text-secondary-400 hover:bg-secondary-700 hover:text-white transition-colors duration-200"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                  <Disclosure.Button
                    as="button"
                    onClick={() => logout()}
                    className="block w-full text-left rounded-xl px-3 py-2 text-base font-medium text-error-400 hover:bg-error-600 hover:text-white transition-colors duration-200"
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 px-2 pb-3 pt-2">
                <Disclosure.Button
                  as={Link}
                  to="/login"
                  className="block rounded-xl px-3 py-2 text-base font-medium text-secondary-300 hover:bg-secondary-700 hover:text-white transition-colors duration-200"
                >
                  Log in
                </Disclosure.Button>
                <Disclosure.Button
                  as={Link}
                  to="/register"
                  className="block rounded-xl bg-primary-600 px-3 py-2 text-base font-medium text-white hover:bg-primary-700 transition-colors duration-200"
                >
                  Sign up
                </Disclosure.Button>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}