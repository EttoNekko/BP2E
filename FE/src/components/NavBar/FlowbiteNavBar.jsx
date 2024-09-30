import { Button, Navbar } from 'flowbite-react';

export default function Component() {
  return (
    <Navbar fluid rounded>
      <Navbar.Brand href='/'>
        <img src='src/assets/react.svg' className='mr-3 h-6 sm:h-9' alt='Flowbite React Logo' />
        <span className='self-center whitespace-nowrap text-xl font-semibold dark:text-white'>
          Flowbite React
        </span>
      </Navbar.Brand>

      <div className='flex md:order-2'>
        <Button>Get started yeahhhhh</Button>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link href='/' active>
          Home
        </Navbar.Link>
        <Navbar.Link href='/box'>Gacha</Navbar.Link>
        <Navbar.Link href='/random'>Services</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
