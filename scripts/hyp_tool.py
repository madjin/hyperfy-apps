#!/usr/bin/env python3
"""
HYP Tool - Unbundle and rebundle Hyperfy .hyp app packages.

Usage:
    hyp_tool.py unbundle <file.hyp> [output_dir]
    hyp_tool.py bundle <dir> [output.hyp]
    hyp_tool.py info <file.hyp>

Commands:
    unbundle    Extract .hyp to directory with blueprint.json and assets/
    bundle      Pack directory back into .hyp file
    info        Show .hyp file contents without extracting

Examples:
    # Extract sit.hyp to sit/ directory
    python hyp_tool.py unbundle sit.hyp

    # Extract to specific directory
    python hyp_tool.py unbundle sit.hyp ./my-app/

    # Repack after editing
    python hyp_tool.py bundle ./my-app/ my-app-fixed.hyp

    # View contents
    python hyp_tool.py info sit.hyp
"""

import argparse
import json
import struct
import sys
from pathlib import Path


def unbundle(hyp_path: Path, output_dir: Path | None = None) -> Path:
    """Extract .hyp file to directory."""
    with open(hyp_path, 'rb') as f:
        data = f.read()

    # Parse header
    header_size = struct.unpack('<I', data[:4])[0]
    header = json.loads(data[4:4 + header_size].decode('utf-8'))

    # Create output directory
    if output_dir is None:
        output_dir = hyp_path.parent / hyp_path.stem
    output_dir.mkdir(parents=True, exist_ok=True)
    assets_dir = output_dir / 'assets'
    assets_dir.mkdir(exist_ok=True)

    # Write blueprint.json
    blueprint_path = output_dir / 'blueprint.json'
    with open(blueprint_path, 'w') as f:
        json.dump(header['blueprint'], f, indent=2)

    # Extract assets
    position = 4 + header_size
    manifest = []

    for asset in header['assets']:
        asset_data = data[position:position + asset['size']]

        # Get filename from URL (asset://filename.ext)
        filename = asset['url'].replace('asset://', '')
        asset_path = assets_dir / filename

        with open(asset_path, 'wb') as f:
            f.write(asset_data)

        manifest.append({
            'type': asset['type'],
            'url': asset['url'],
            'filename': filename,
            'size': asset['size'],
            'mime': asset.get('mime', '')
        })

        position += asset['size']

    # Write manifest.json (asset metadata)
    manifest_path = output_dir / 'manifest.json'
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"Extracted to: {output_dir}/")
    print(f"  blueprint.json - app configuration")
    print(f"  manifest.json  - asset metadata")
    print(f"  assets/        - {len(manifest)} files")

    return output_dir


def bundle(input_dir: Path, output_path: Path | None = None) -> Path:
    """Pack directory into .hyp file."""
    input_dir = Path(input_dir)

    # Read blueprint
    blueprint_path = input_dir / 'blueprint.json'
    if not blueprint_path.exists():
        raise FileNotFoundError(f"No blueprint.json found in {input_dir}")

    with open(blueprint_path) as f:
        blueprint = json.load(f)

    # Read manifest
    manifest_path = input_dir / 'manifest.json'
    if not manifest_path.exists():
        raise FileNotFoundError(f"No manifest.json found in {input_dir}")

    with open(manifest_path) as f:
        manifest = json.load(f)

    # Collect assets
    assets_dir = input_dir / 'assets'
    assets = []
    assets_data = b''

    for item in manifest:
        asset_path = assets_dir / item['filename']
        if not asset_path.exists():
            raise FileNotFoundError(f"Asset not found: {asset_path}")

        with open(asset_path, 'rb') as f:
            data = f.read()

        assets.append({
            'type': item['type'],
            'url': item['url'],
            'size': len(data),
            'mime': item.get('mime', '')
        })
        assets_data += data

    # Build header
    header = {
        'blueprint': blueprint,
        'assets': assets
    }
    header_json = json.dumps(header, separators=(',', ':')).encode('utf-8')

    # Build .hyp file
    hyp_data = struct.pack('<I', len(header_json)) + header_json + assets_data

    # Write output
    if output_path is None:
        output_path = input_dir.parent / f"{input_dir.name}.hyp"

    with open(output_path, 'wb') as f:
        f.write(hyp_data)

    print(f"Created: {output_path}")
    print(f"  Size: {len(hyp_data):,} bytes")
    print(f"  Assets: {len(assets)}")

    return output_path


def info(hyp_path: Path) -> dict:
    """Show .hyp file info without extracting."""
    with open(hyp_path, 'rb') as f:
        data = f.read()

    header_size = struct.unpack('<I', data[:4])[0]
    header = json.loads(data[4:4 + header_size].decode('utf-8'))

    bp = header['blueprint']
    print(f"File: {hyp_path}")
    print(f"Size: {len(data):,} bytes")
    print(f"\nBlueprint:")
    print(f"  Name: {bp.get('name', 'N/A')}")
    print(f"  Model: {bp.get('model', 'N/A')}")
    print(f"  Script: {bp.get('script', 'N/A')}")

    if bp.get('props'):
        print(f"  Props:")
        for key, val in bp['props'].items():
            if isinstance(val, dict) and 'url' in val:
                print(f"    {key}: {val.get('type', '?')} -> {val['url']}")
            else:
                print(f"    {key}: {val}")

    print(f"\nAssets ({len(header['assets'])}):")
    for asset in header['assets']:
        filename = asset['url'].replace('asset://', '')
        print(f"  [{asset['type']}] {filename} ({asset['size']:,} bytes)")

    return header


def main():
    parser = argparse.ArgumentParser(
        description='HYP Tool - Unbundle and rebundle Hyperfy .hyp packages',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    subparsers = parser.add_subparsers(dest='command', required=True)

    # unbundle command
    unbundle_parser = subparsers.add_parser('unbundle', help='Extract .hyp to directory')
    unbundle_parser.add_argument('hyp_file', type=Path, help='.hyp file to extract')
    unbundle_parser.add_argument('output_dir', type=Path, nargs='?', help='Output directory')

    # bundle command
    bundle_parser = subparsers.add_parser('bundle', help='Pack directory into .hyp')
    bundle_parser.add_argument('input_dir', type=Path, help='Directory to pack')
    bundle_parser.add_argument('output_file', type=Path, nargs='?', help='Output .hyp file')

    # info command
    info_parser = subparsers.add_parser('info', help='Show .hyp contents')
    info_parser.add_argument('hyp_file', type=Path, help='.hyp file to inspect')

    args = parser.parse_args()

    if args.command == 'unbundle':
        unbundle(args.hyp_file, args.output_dir)
    elif args.command == 'bundle':
        bundle(args.input_dir, args.output_file)
    elif args.command == 'info':
        info(args.hyp_file)


if __name__ == '__main__':
    main()
